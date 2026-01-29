class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.clear();
  }

  clear() {
    this.expression = '';   // store full expression string
    this.error = null;
  }

  delete() {
    if (this.error) { this.error = null; this.expression = ''; return; }
    this.expression = this.expression.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (this.error) { this.error = null; this.expression = ''; }
    // Prevent multiple decimals in the same number
    const tokens = this.expression.split(/[\+\-\*\/÷]/);
    const lastToken = tokens[tokens.length - 1];
    if (number === '.' && lastToken.includes('.')) return;

    this.expression = this.expression.toString() + number.toString();
  }

  chooseOperation(operation) {
    if (this.expression === '') return;
    const lastChar = this.expression.slice(-1);
    // Prevent two operators in a row
    if (['+', '-', '*', '/', '÷'].includes(lastChar)) {
      this.expression = this.expression.slice(0, -1) + operation;
    } else {
      this.expression += operation;
    }
  }

  // SCIENTIFIC OPERATIONS
  scientificOperation(op) {
    if (this.error) { 
      this.error = null; 
      this.expression = ''; 
    }
    
    if (this.expression === '') return;
    
    try {
      let value = parseFloat(this.expression);
      
      switch(op) {
        case 'sqrt':
          if (value < 0) {
            this.error = 'Error: √ of negative';
            break;
          }
          this.expression = Math.sqrt(value).toString();
          break;
        case 'square':
          this.expression = (value * value).toString();
          break;
        case 'reciprocal':
          if (value === 0) {
            this.error = 'Error: 1/0 undefined';
            break;
          }
          this.expression = (1 / value).toString();
          break;
        case 'pi':
          this.expression = Math.PI.toString();
          break;
      }
    } catch (e) {
      this.error = 'Error';
    }
  }

  compute() {
    try {
      let expr = this.expression;
      // Replace division symbol with JS operator
      expr = expr.replace(/÷/g, '/');

      // Evaluate with operator precedence
      const result = Function('"use strict";return (' + expr + ')')();

      // Normalize floating point errors
      const rounded = Math.round(result * 1e12) / 1e12;

      this.expression = rounded.toString();
    } catch (e) {
      this.error = 'Error';
    }
  }

  updateDisplay() {
    if (this.error) {
      this.currentOperandTextElement.innerText = this.error;
      this.previousOperandTextElement.innerText = '';
      return;
    }
    this.currentOperandTextElement.innerText = this.expression;
    this.previousOperandTextElement.innerText = '';
  }
}

// Query elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Mouse/touch events
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText);
    calculator.updateDisplay();
  });
});

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  });
});

equalsButton.addEventListener('click', () => {
  calculator.compute();
  calculator.updateDisplay();
});

allClearButton.addEventListener('click', () => {
  calculator.clear();
  calculator.updateDisplay();
});

deleteButton.addEventListener('click', () => {
  calculator.delete();
  calculator.updateDisplay();
});

// Scientific buttons event listeners
const scientificButtons = document.querySelectorAll('[data-operation="sqrt"], [data-operation="square"], [data-operation="reciprocal"], [data-operation="pi"]');

scientificButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.scientificOperation(button.dataset.operation);
    calculator.updateDisplay();
  });
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;

  if ((/^[0-9]$/).test(key)) {
    calculator.appendNumber(key);
    calculator.updateDisplay();
    return;
  }

  if (key === '.') {
    calculator.appendNumber('.');
    calculator.updateDisplay();
    return;
  }

  if (['+', '-', '*', '/', '÷'].includes(key)) {
    const op = key === '/' ? '÷' : key;
    calculator.chooseOperation(op);
    calculator.updateDisplay();
    return;
  }

  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calculator.compute();
    calculator.updateDisplay();
    return;
  }

  if (key === 'Backspace') {
    calculator.delete();
    calculator.updateDisplay();
    return;
  }

  if (key.toLowerCase() === 'c' || key === 'Escape') {
    calculator.clear();
    calculator.updateDisplay();
    return;
  }

  // Scientific keyboard shortcuts
  if (key.toLowerCase() === 'q') { // √ (Square Root)
    calculator.scientificOperation('sqrt');
    calculator.updateDisplay();
    return;
  }
  
  if (key.toLowerCase() === 's') { // Square (x²)
    calculator.scientificOperation('square');
    calculator.updateDisplay();
    return;
  }
  
  if (key.toLowerCase() === 'r') { // Reciprocal (1/x)
    calculator.scientificOperation('reciprocal');
    calculator.updateDisplay();
    return;
  }
  
  if (key.toLowerCase() === 'p') { // Pi (π)
    calculator.scientificOperation('pi');
    calculator.updateDisplay();
    return;
  }
});