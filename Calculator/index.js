// operator functions
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

// DOM references
const display = document.getElementById("display");
const digitButtons = document.querySelectorAll(".digit");
const operatorButtons = document.querySelectorAll(".operator");
const equalsButton = document.getElementById("equals");
const clearButton = document.getElementById("clear");

// state
let currentInput = "0";
let firstNumber = null;
let operatorSymbol = null;
let shouldResetInput = false;
let hasError = false;

function updateDisplay() {
  display.textContent = currentInput;
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

  if (currentInput === "0" && digit !== ".") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }

  updateDisplay();
}

function handleOperator(operator) {
  if (hasError) return;

  const inputValue = parseFloat(currentInput);

  if (operatorSymbol && !shouldResetInput) {
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
    firstNumber = result; // keep full precision internally, rounded string only for display
  } else {
    firstNumber = inputValue;
  }

  operatorSymbol = operator;
  shouldResetInput = true;
  updateDisplay();
}

function handleEquals() {
  if (hasError || operatorSymbol === null || shouldResetInput) return;

  const inputValue = parseFloat(currentInput);
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
  updateDisplay();
}

digitButtons.forEach(button => {
  button.addEventListener("click", () => inputDigit(button.dataset.digit));
});

operatorButtons.forEach(button => {
  button.addEventListener("click", () => handleOperator(button.dataset.operator));
});

equalsButton.addEventListener("click", handleEquals);
clearButton.addEventListener("click", clearAll);

updateDisplay();