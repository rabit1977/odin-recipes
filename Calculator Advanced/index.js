// ---- operator functions ----
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }

function operate(operator, a, b) {
  switch (operator) {
    case "+": return add(a, b);
    case "-": return subtract(a, b);
    case "*": return multiply(a, b);
    case "/":
      if (b === 0) return "Nice try, but no.";
      return divide(a, b);
    default: return null;
  }
}

// rounds long decimals so they don't overflow the display
function formatResult(num) {
  if (!isFinite(num)) return "Error";
  const rounded = Math.round(num * 1e8) / 1e8;
  let str = String(rounded);
  if (str.replace("-", "").replace(".", "").length > 10) {
    str = rounded.toPrecision(10);
    if (!str.includes("e")) str = String(parseFloat(str));
  }
  return str;
}

// pretty symbols for the expression line (data-operator stays raw +-*/)
const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// ---- DOM references ----
const expressionEl = document.getElementById("expression");
const display = document.getElementById("display");
const digitButtons = document.querySelectorAll(".digit");
const operatorButtons = document.querySelectorAll(".operator");
const equalsButton = document.getElementById("equals");
const clearButton = document.getElementById("clear");
const backspaceButton = document.getElementById("backspace");
const percentButton = document.getElementById("percent");
const signButton = document.getElementById("sign");
const decimalButton = document.querySelector('[data-digit="."]');

// ---- state ----
let currentInput = "0";
let firstNumber = null;
let operatorSymbol = null;
let shouldResetInput = false;
let hasError = false;

function updateDisplay() {
  display.textContent = currentInput;
  decimalButton.disabled = !shouldResetInput && currentInput.includes(".");
}

function inputDigit(digit) {
  if (shouldResetInput) {
    currentInput = digit === "." ? "0." : digit;
    shouldResetInput = false;
    hasError = false;
    updateDisplay();
    return;
  }
  if (digit === "." && currentInput.includes(".")) return;
  currentInput = (currentInput === "0" && digit !== ".") ? digit : currentInput + digit;
  updateDisplay();
}

function handleBackspace() {
  if (shouldResetInput || hasError) return;
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  updateDisplay();
}

function handlePercent() {
  if (shouldResetInput || hasError) return; // same guard as backspace: don't edit a frozen result
  currentInput = formatResult(parseFloat(currentInput) / 100);
  updateDisplay();
}

function toggleSign() {
  if (shouldResetInput || hasError || currentInput === "0") return;
  currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
  updateDisplay();
}

function handleOperator(operator) {
  if (hasError) return;
  const inputValue = parseFloat(currentInput);

  if (operatorSymbol && !shouldResetInput) {
    expressionEl.textContent = `${formatResult(firstNumber)} ${operatorSymbols[operatorSymbol]} ${formatResult(inputValue)} =`;
    const result = operate(operatorSymbol, firstNumber, inputValue);

    if (typeof result !== "number") {
      currentInput = result;
      firstNumber = null;
      operatorSymbol = null;
      hasError = true;
      shouldResetInput = true;
      updateDisplay();
      return;
    }
    currentInput = formatResult(result);
    firstNumber = result;
  } else {
    firstNumber = inputValue;
  }

  operatorSymbol = operator;
  shouldResetInput = true;
  expressionEl.textContent = `${formatResult(firstNumber)} ${operatorSymbols[operator]}`;
  updateDisplay();
}

function handleEquals() {
  if (hasError || operatorSymbol === null || shouldResetInput) return;
  const inputValue = parseFloat(currentInput);
  expressionEl.textContent = `${formatResult(firstNumber)} ${operatorSymbols[operatorSymbol]} ${formatResult(inputValue)} =`;

  const result = operate(operatorSymbol, firstNumber, inputValue);
  if (typeof result !== "number") {
    currentInput = result;
    hasError = true;
  } else {
    currentInput = formatResult(result);
  }

  firstNumber = null;
  operatorSymbol = null;
  shouldResetInput = true;
  updateDisplay();
}

function clearAll() {
  currentInput = "0";
  firstNumber = null;
  operatorSymbol = null;
  shouldResetInput = false;
  hasError = false;
  expressionEl.textContent = "";
  updateDisplay();
}

function flashButton(button) {
  if (!button) return;
  button.classList.add("active");
  setTimeout(() => button.classList.remove("active"), 100);
}

// ---- click listeners ----
digitButtons.forEach(b => b.addEventListener("click", () => inputDigit(b.dataset.digit)));
operatorButtons.forEach(b => b.addEventListener("click", () => handleOperator(b.dataset.operator)));
equalsButton.addEventListener("click", handleEquals);
clearButton.addEventListener("click", clearAll);
backspaceButton.addEventListener("click", handleBackspace);
percentButton.addEventListener("click", handlePercent);
signButton.addEventListener("click", toggleSign);

// ---- keyboard support ----
document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (/[0-9]/.test(key) || key === ".") {
    inputDigit(key);
    flashButton(document.querySelector(`[data-digit="${key}"]`));
  } else if (["+", "-", "*", "/"].includes(key)) {
    handleOperator(key);
    flashButton(document.querySelector(`[data-operator="${key}"]`));
  } else if (key === "Enter" || key === "=") {
    handleEquals();
    flashButton(equalsButton);
  } else if (key === "Backspace") {
    handleBackspace();
    flashButton(backspaceButton);
  } else if (key === "Escape") {
    clearAll();
    flashButton(clearButton);
  } else if (key === "%") {
    handlePercent();
    flashButton(percentButton);
  }
});

updateDisplay();