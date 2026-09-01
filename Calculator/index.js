function add(a, b) {
  return a + b;
}

function substract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

let firstNumber = 3;
let operatorSymbol = '+';
let secondNumber = 5;

function operate(operator, a, b) {
  switch (operator) {
    case '+':
      return add(a, b);
    case '-':
      return substract(a, b);
    case '*':
      return multiply(a, b);
    case '/':
      return divide(a, b);
    default:
      return null;
  }
}

const display = document.getElementById('display');
const digitButtons = document.querySelectorAll('.digit');

let currentIput = '0';

function updateDisplay() {
  display.textContent = currentIput;
}

function inputDigit(digit) {
  if (digit === '.' && currentIput.includes('.')) return;

  if (currentIput === '0' && digit !== '.') {
    currentIput = digit;
  } else {
    currentIput += digit;
  }

  updateDisplay();
}

digitButtons.forEach((button) => {
  button.addEventListener('click', () => {
    inputDigit(button.dataset.digit);
  });
});

updateDisplay();