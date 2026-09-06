'use strict';

/* ============================================================
DOM
============================================================ */

const expressionEl = document.getElementById('expression');
const displayEl = document.getElementById('display');

const digitButtons = document.querySelectorAll('.digit');
const operatorButtons = document.querySelectorAll('.operator');

const equalsButton = document.getElementById('equals');
const clearButton = document.getElementById('clear');
const backspaceButton = document.getElementById('backspace');
const percentButton = document.getElementById('percent');
const signButton = document.getElementById('sign');

const memClearButton = document.getElementById('memClear');
const memRecallButton = document.getElementById('memRecall');
const memAddButton = document.getElementById('memAdd');
const memSubtractButton = document.getElementById('memSubtract');

const memoryIndicator = document.getElementById('memoryIndicator');

const historyList = document.getElementById('historyList');

const historyClearButton = document.getElementById('historyClear');

const themeToggle = document.getElementById('themeToggle');

const copyButton = document.getElementById('copyButton');

const modeToggle = document.getElementById('modeToggle');

const scientificButtons = document.getElementById('scientificButtons');

/* ============================================================
CONSTANTS
============================================================ */

const STORAGE = {
  theme: 'calculatorTheme',
  history: 'calculatorHistory',
  memory: 'calculatorMemory',
};

const DISPLAY_OPERATORS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '^': '^',
};

const PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
};

/* ============================================================
STATE
============================================================ */

let expression = '';

let currentInput = '0';

let shouldResetInput = false;

let hasError = false;

let memoryValue = loadMemory();

let history = loadHistory();

let scientificMode = false;

let undoStack = [];

let redoStack = [];

/* ============================================================
STORAGE
============================================================ */

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.history) || '[]');
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE.history, JSON.stringify(history));
}

function loadMemory() {
  const value = Number(localStorage.getItem(STORAGE.memory));

  return Number.isFinite(value) ? value : 0;
}

function saveMemory() {
  localStorage.setItem(STORAGE.memory, String(memoryValue));
}

/* ============================================================
FORMATTING
============================================================ */

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  if (Object.is(value, -0)) {
    value = 0;
  }

  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;

  const absolute = Math.abs(rounded);

  if (absolute >= 1e12 || (absolute > 0 && absolute < 1e-9)) {
    return rounded.toExponential(8);
  }

  return String(rounded);
}

function getNumericInput() {
  const value = Number(currentInput);

  if (!Number.isFinite(value)) {
    throw new Error('Invalid number');
  }

  return value;
}

/* ============================================================
DISPLAY
============================================================ */

function updateDisplay() {
  displayEl.textContent = currentInput;
  expressionEl.textContent = expression;

  memoryIndicator.classList.toggle('visible', memoryValue !== 0);
}

/* ============================================================
EXPRESSION HELPERS (previously missing — this was the crash)
============================================================ */

/**
 * Builds the full string that should be handed to the parser when
 * "=" is pressed. `expression` holds everything typed so far up to
 * (and including) the last operator; `currentInput` holds the number
 * currently being typed (or, if an operator was just pressed and
 * shouldResetInput is true, the last-entered operand — which mirrors
 * standard calculator behavior for e.g. "6 + =" -> 12).
 */
function expressionForCalculation() {
  if (!expression) {
    return currentInput;
  }

  return expression + currentInput;
}

/**
 * Converts the raw calculation string (built with plain +, -, *, /, ^ chars)
 * into the prettier symbols used for on-screen display (×, ÷, −),
 * without touching the string that actually gets tokenized/evaluated.
 */
function displayExpression(input) {
  return input
    .replace(
      /[+\-*/^]/g,
      (operator) => ` ${DISPLAY_OPERATORS[operator] || operator} `,
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/* ============================================================
UNDO / REDO
============================================================ */

function snapshot() {
  return {
    expression,
    currentInput,
    shouldResetInput,
    hasError,
  };
}

function restore(state) {
  expression = state.expression;
  currentInput = state.currentInput;
  shouldResetInput = state.shouldResetInput;
  hasError = state.hasError;

  updateDisplay();
}

function saveState() {
  undoStack.push(snapshot());

  if (undoStack.length > 50) {
    undoStack.shift();
  }

  redoStack = [];
}

function undo() {
  if (!undoStack.length) return;

  redoStack.push(snapshot());

  restore(undoStack.pop());
}

function redo() {
  if (!redoStack.length) return;

  undoStack.push(snapshot());

  restore(redoStack.pop());
}

/* ============================================================
TOKENIZER
============================================================ */

function tokenize(input) {
  const tokens = [];

  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (char === ' ') {
      i++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let number = '';

      while (i < input.length && /[0-9.]/.test(input[i])) {
        number += input[i];
        i++;
      }

      if (number === '.' || number.split('.').length > 2) {
        throw new Error('Invalid number');
      }

      const value = Number(number);

      if (!Number.isFinite(value)) {
        throw new Error('Invalid number');
      }

      tokens.push(value);

      continue;
    }

    if ('+-*/^()'.includes(char)) {
      tokens.push(char);
      i++;

      continue;
    }

    throw new Error('Invalid expression');
  }

  return tokens;
}

/* ============================================================
EXPRESSION PARSER
============================================================ */

function evaluateExpression(input) {
  const tokens = tokenize(input);

  if (!tokens.length) {
    return 0;
  }

  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume() {
    return tokens[position++];
  }

  function parseExpression() {
    let value = parseTerm();

    while (peek() === '+' || peek() === '-') {
      const operator = consume();

      const right = parseTerm();

      if (operator === '+') {
        value += right;
      } else {
        value -= right;
      }
    }

    return value;
  }

  function parseTerm() {
    let value = parsePower();

    while (peek() === '*' || peek() === '/') {
      const operator = consume();

      const right = parsePower();

      if (operator === '/' && right === 0) {
        throw new Error('Cannot divide by zero');
      }

      if (operator === '*') {
        value *= right;
      } else {
        value /= right;
      }
    }

    return value;
  }

  function parsePower() {
    let value = parseUnary();

    if (peek() === '^') {
      consume();

      const exponent = parsePower();

      value = Math.pow(value, exponent);
    }

    return value;
  }

  // NOTE ON PRECEDENCE: unary minus is handled here, one level below
  // parsePower/parsePrimary, so that "-2^2" parses as -(2^2) = -4
  // (the mathematically standard convention: exponentiation binds
  // tighter than a leading unary minus) instead of (-2)^2 = 4.
  function parseUnary() {
    if (peek() === '+') {
      consume();
      return parseUnary();
    }

    if (peek() === '-') {
      consume();
      return -parsePower();
    }

    return parsePrimary();
  }

  function parsePrimary() {
    const token = consume();

    if (typeof token === 'number') {
      return token;
    }

    if (token === '(') {
      const value = parseExpression();

      if (consume() !== ')') {
        throw new Error('Missing closing parenthesis');
      }

      return value;
    }

    throw new Error('Invalid expression');
  }

  const result = parseExpression();

  if (position < tokens.length) {
    throw new Error('Invalid expression');
  }

  return result;
}

function inputDigit(digit) {
  if (hasError) {
    clearAll(false);
  }

  if (shouldResetInput) {
    currentInput = '0';
    shouldResetInput = false;
  }

  if (digit === '.' && currentInput.includes('.')) {
    return;
  }

  if (currentInput === '0' && digit !== '.') {
    currentInput = digit;
  } else {
    currentInput += digit;
  }

  updateDisplay();
}

/* ============================================================
OPERATORS
============================================================ */

function handleOperator(operator) {
  if (hasError) return;

  saveState();

  /*
If the user presses another operator,
replace the previous pending operator.


Example:

6 + ×

becomes:

6 ×


*/

  if (shouldResetInput) {
    expression = expression.replace(/[+\-*/^]\s*$/, '');

    expression += `${operator} `;

    updateDisplay();

    return;
  }

  /*
Add current number to expression.
*/

  if (!expression) {
    expression = currentInput;
  } else {
    expression += currentInput;
  }

  expression += `${operator}`;

  shouldResetInput = true;

  updateDisplay();
}

/* ============================================================
EQUALS
============================================================ */

function handleEquals() {
  if (hasError) return;

  if (!expression) return;

  saveState();

  const calculation = expressionForCalculation();

  try {
    const result = evaluateExpression(calculation);

    const resultText = formatNumber(result);

    const displayExpr = displayExpression(calculation);

    expressionEl.textContent = `${displayExpr} =`;

    currentInput = resultText;

    expression = '';

    shouldResetInput = true;

    addToHistory(displayExpr, resultText);
  } catch (error) {
    expressionEl.textContent = displayExpression(calculation);

    currentInput = error.message;

    expression = '';

    hasError = true;

    shouldResetInput = true;
  }

  updateDisplay();
}

/* ============================================================
PARENTHESES
============================================================ */

function openParenthesis() {
  if (hasError) {
    clearAll(false);
  }

  saveState();

  if (!shouldResetInput && currentInput !== '0') {
    expression += `${currentInput} * `;
  }

  expression += '(';

  currentInput = '0';

  shouldResetInput = false;

  updateDisplay();
}

function closeParenthesis() {
  if (hasError) return;

  saveState();

  if (!shouldResetInput) {
    expression += currentInput;
  }

  expression += ')';

  currentInput = '0';

  shouldResetInput = false;

  updateDisplay();
}

/* ============================================================
BACKSPACE
============================================================ */

function handleBackspace() {
  if (hasError || shouldResetInput) {
    return;
  }

  saveState();

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }

  updateDisplay();
}

/* ============================================================
SIGN
============================================================ */

function toggleSign() {
  if (hasError) return;

  if (currentInput === '0') return;

  saveState();

  currentInput = currentInput.startsWith('-')
    ? currentInput.slice(1)
    : `-${currentInput}`;

  updateDisplay();
}

/* ============================================================
PERCENT
============================================================ */

function handlePercent() {
  if (hasError || shouldResetInput) {
    return;
  }

  saveState();

  const current = getNumericInput();

  const match = expression.match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*$/);

  if (match) {
    const base = Number(match[1]);

    const operator = match[2];

    if (operator === '+' || operator === '-') {
      currentInput = formatNumber((base * current) / 100);
    } else {
      currentInput = formatNumber(current / 100);
    }
  } else {
    currentInput = formatNumber(current / 100);
  }

  updateDisplay();
}

/* ============================================================
MEMORY
============================================================ */

function memoryClear() {
  saveState();

  memoryValue = 0;

  saveMemory();

  updateDisplay();
}

function memoryRecall() {
  if (hasError) return;

  saveState();

  currentInput = formatNumber(memoryValue);

  shouldResetInput = false;

  updateDisplay();
}

function memoryAdd() {
  if (hasError) return;

  saveState();

  memoryValue += getNumericInput();

  saveMemory();

  updateDisplay();
}

function memorySubtract() {
  if (hasError) return;

  saveState();

  memoryValue -= getNumericInput();

  saveMemory();

  updateDisplay();
}

/* ============================================================
SCIENTIFIC
============================================================ */

function scientificAction(action) {
  if (hasError) return;

  const value = getNumericInput();

  // "power" just queues up the ^ operator via the normal operator
  // pathway, which already calls saveState()/updateDisplay() itself,
  // so we return before the generic saveState() below to avoid
  // pushing a duplicate (redundant) undo entry.
  if (action === 'power') {
    handleOperator('^');
    return;
  }

  saveState();

  let result;

  switch (action) {
    case 'sqrt':
      if (value < 0) {
        showError('Invalid √');
        return;
      }

      result = Math.sqrt(value);

      break;

    case 'square':
      result = value ** 2;

      break;

    case 'inverse':
      if (value === 0) {
        showError('Cannot divide by zero');

        return;
      }

      result = 1 / value;

      break;

    default:
      return;
  }

  currentInput = formatNumber(result);

  shouldResetInput = false;

  updateDisplay();
}

function scientificFunction(fn) {
  if (hasError) return;

  const value = getNumericInput();

  saveState();

  let result;

  switch (fn) {
    case 'sin':
      result = Math.sin((value * Math.PI) / 180);

      break;

    case 'cos':
      result = Math.cos((value * Math.PI) / 180);

      break;

    case 'tan':
      result = Math.tan((value * Math.PI) / 180);

      break;

    case 'log':
      if (value <= 0) {
        showError('Invalid log');
        return;
      }

      result = Math.log10(value);

      break;

    case 'ln':
      if (value <= 0) {
        showError('Invalid ln');
        return;
      }

      result = Math.log(value);

      break;

    default:
      return;
  }

  currentInput = formatNumber(result);

  shouldResetInput = false;

  updateDisplay();
}

function insertConstant(name) {
  if (hasError) {
    clearAll(false);
  }

  saveState();

  const value = name === 'pi' ? Math.PI : Math.E;

  // If there's a number already sitting in currentInput that the user
  // typed (and it isn't just the placeholder "0"), commit it to the
  // expression first so it isn't silently overwritten/lost, inserting
  // an implicit multiplication — mirrors openParenthesis()'s behavior.
  if (!shouldResetInput && currentInput !== '0') {
    expression += `${currentInput} * `;
  } else if (expression && !shouldResetInput) {
    expression += ' * ';
  }

  currentInput = formatNumber(value);

  shouldResetInput = false;

  updateDisplay();
}

/* ============================================================
ERROR
============================================================ */

function showError(message) {
  expression = '';

  currentInput = message;

  hasError = true;

  shouldResetInput = true;

  updateDisplay();
}

/* ============================================================
HISTORY
============================================================ */

function addToHistory(expressionText, resultText) {
  history.unshift({
    expression: expressionText,
    result: resultText,
    timestamp: Date.now(),
  });

  history = history.slice(0, 50);

  saveHistory();

  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML = `<li class="history-empty">
    No calculations yet
  </li>`;

    return;
  }

  historyList.innerHTML = '';

  history.forEach((item, index) => {
    const li = document.createElement('li');

    const expr = document.createElement('div');

    expr.className = 'history-expression';

    expr.textContent = item.expression;

    const result = document.createElement('div');

    result.className = 'history-result';

    result.textContent = `= ${item.result}`;

    li.appendChild(expr);
    li.appendChild(result);

    li.addEventListener('click', () => recallHistory(index));

    historyList.appendChild(li);
  });
}

function recallHistory(index) {
  if (hasError) return;

  const item = history[index];

  saveState();

  expressionEl.textContent = `${item.expression} =`;

  currentInput = item.result;

  expression = '';

  shouldResetInput = true;

  updateDisplay();
}

function clearHistory() {
  history = [];

  saveHistory();

  renderHistory();
}

/* ============================================================
COPY
============================================================ */

async function copyResult() {
  if (hasError) return;

  try {
    await navigator.clipboard.writeText(currentInput);

    const old = copyButton.textContent;

    copyButton.textContent = '✓';

    setTimeout(() => {
      copyButton.textContent = old;
    }, 1000);
  } catch {
    // Clipboard unavailable.
  }
}

/* ============================================================
THEME
============================================================ */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';

  localStorage.setItem(STORAGE.theme, theme);
}

function toggleTheme() {
  const current =
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

  applyTheme(current === 'light' ? 'dark' : 'light');
}

/* ============================================================
SCIENTIFIC MODE
============================================================ */

function toggleScientificMode() {
  scientificMode = !scientificMode;

  scientificButtons.classList.toggle('hidden', !scientificMode);

  modeToggle.textContent = scientificMode ? 'Basic' : 'Scientific';
}

/* ============================================================
BUTTON FLASH
============================================================ */

function flashButton(button) {
  if (!button) return;

  button.classList.add('active');

  setTimeout(() => button.classList.remove('active'), 100);
}

/* ============================================================
CLICK EVENTS
============================================================ */

digitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    saveState();

    inputDigit(button.dataset.digit);
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleOperator(button.dataset.operator);
  });
});

equalsButton.addEventListener('click', handleEquals);

clearButton.addEventListener('click', () => clearAll(true));

backspaceButton.addEventListener('click', handleBackspace);

percentButton.addEventListener('click', handlePercent);

signButton.addEventListener('click', toggleSign);

memClearButton.addEventListener('click', memoryClear);

memRecallButton.addEventListener('click', memoryRecall);

memAddButton.addEventListener('click', memoryAdd);

memSubtractButton.addEventListener('click', memorySubtract);

historyClearButton.addEventListener('click', clearHistory);

themeToggle.addEventListener('click', toggleTheme);

copyButton.addEventListener('click', copyResult);

modeToggle.addEventListener('click', toggleScientificMode);

/* ============================================================
SCIENTIFIC EVENTS
============================================================ */

scientificButtons.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'openParen') {
      openParenthesis();
    } else if (action === 'closeParen') {
      closeParenthesis();
    } else {
      scientificAction(action);
    }
  });
});

scientificButtons.querySelectorAll('[data-function]').forEach((button) => {
  button.addEventListener('click', () =>
    scientificFunction(button.dataset.function),
  );
});

scientificButtons.querySelectorAll('[data-constant]').forEach((button) => {
  button.addEventListener('click', () =>
    insertConstant(button.dataset.constant),
  );
});

/* ============================================================
CLEAR
============================================================ */

function clearAll(save = true) {
  if (save) {
    saveState();
  }

  expression = '';

  currentInput = '0';

  shouldResetInput = false;

  hasError = false;

  updateDisplay();
}

/* ============================================================
KEYBOARD
============================================================ */

document.addEventListener('keydown', (event) => {
  const key = event.key;

  /* Numbers */

  if (/^[0-9]$/.test(key)) {
    event.preventDefault();

    const button = document.querySelector(`[data-digit="${key}"]`);

    flashButton(button);

    saveState();

    inputDigit(key);

    return;
  }

  /* Decimal */

  if (key === '.') {
    event.preventDefault();

    const button = document.querySelector('[data-digit="."]');

    flashButton(button);

    saveState();

    inputDigit('.');

    return;
  }

  /* Operators */

  if (['+', '-', '*', '/'].includes(key)) {
    event.preventDefault();

    const button = document.querySelector(`[data-operator="${key}"]`);

    flashButton(button);

    handleOperator(key);

    return;
  }

  /* Equals */

  if (key === 'Enter' || key === '=') {
    event.preventDefault();

    flashButton(equalsButton);

    handleEquals();

    return;
  }

  /* Backspace */

  if (key === 'Backspace') {
    event.preventDefault();

    flashButton(backspaceButton);

    handleBackspace();

    return;
  }

  /* Clear */

  if (key === 'Escape' || key === 'Delete') {
    event.preventDefault();

    flashButton(clearButton);

    clearAll(true);

    return;
  }

  /* Percentage */

  if (key === '%') {
    event.preventDefault();

    flashButton(percentButton);

    handlePercent();

    return;
  }

  /* Parentheses */

  if (key === '(') {
    event.preventDefault();

    openParenthesis();

    return;
  }

  if (key === ')') {
    event.preventDefault();

    closeParenthesis();

    return;
  }

  /* Undo */

  if (key.toLowerCase() === 'z' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();

    undo();

    return;
  }

  /* Redo */

  if (key.toLowerCase() === 'y' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();

    redo();

    return;
  }
});

/* ============================================================
INIT
============================================================ */

applyTheme(localStorage.getItem(STORAGE.theme) || 'dark');

renderHistory();

updateDisplay();
