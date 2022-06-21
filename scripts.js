import test from './util/test.js';
import { hasDecimal, clearState, elementIsNotEmpty, isOperand, resetSecondaryOperands, stateOfButtons } from './util/utility-functions.js';
const state = {
  equation: [],
  currentNumber: undefined,
  history: [],
  memory: undefined,
  equals: false,
  buttons: { percent: false, fraction: false, square: false, squareRoot: false },
};
const result = document.querySelector('.result');
const equation = document.querySelector('.equation');
const historyElement = document.querySelector('.history');
const memoryElement = document.querySelector('.memory');
const deleteBtn = document.querySelector('.delete');

const CANNOT_DIVID_BY_0 = 'Cannot divide by 0';
const INVALID_INPUT = 'Invalid Input';

document.addEventListener('DOMContentLoaded', e => {
  toggleMemoryButtons();
});

document.addEventListener('click', e => {
  const parent = e.target.closest('button');
  if (parent == undefined) return;
  if (state.currentNumber === CANNOT_DIVID_BY_0 || state.currentNumber === INVALID_INPUT) {
    toggleButtons();
    clearState(state);
    displayEquation();
  }
  if (parent.matches('[data-memory-clear]')) {
    state.memory = undefined;
    displayMemory();
    return;
  }
  if (parent.matches('[data-memory-recall]')) {
    state.currentNumber = String(state.memory);
    displayResult();
    return;
  }
  if (parent.matches('[data-memory-add]')) {
    state.memory += Number(result.innerText);
    changeMemory(state.currentNumber);
    return;
  }
  if (parent.matches('[data-memory-subtract]')) {
    state.memory -= Number(result.innerText);
    changeMemory();
    return;
  }
  if (parent.matches('[data-memory-store]')) {
    state.memory = Number(result.innerText);
    state.currentNumber = undefined;
    displayMemory();
    displayEquation();
    return;
  }
  if (parent.matches('[data-number]')) {
    resetSecondaryOperands(state);
    if (state.equals === true) {
      state.equals = false;
      displayEquation();
    }
    if (state.currentNumber === '0') state.currentNumber = undefined;

    increaseDigits(parent.dataset.number);
  }
  if (parent.matches('[data-clear-entry]')) {
    state.currentNumber = undefined;
  }
  if (parent.matches('[data-clear-inputs]')) {
    clearState(state);
    displayEquation();
  }
  if (parent.matches('[data-backspace]')) {
    if (state.currentNumber == undefined) return;
    decreaseDigits();
  }
  if (parent.matches('[data-percent]')) {
    if (stateOfButtons(state.buttons)) {
      state.equation.pop();
    }
    resetSecondaryOperands(state);
    state.buttons.percent = true;
    const firstNumber = state.equation.length === 0 ? 0 : Number(state.equation[0]);
    const secondNumber = state.currentNumber == undefined ? firstNumber : Number(eval(state.currentNumber));
    state.currentNumber = String((firstNumber * secondNumber) / 100);
    state.equation.push(state.currentNumber);

    displayEquation();
  }
  if (parent.matches('[data-fraction]')) {
    if (state.currentNumber == undefined) state.currentNumber = '0';
    if (stateOfButtons(state.buttons)) {
      state.equation.pop();
    }
    resetSecondaryOperands(state);
    state.buttons.fraction = true;
    const fraction = `1/${eval(state.currentNumber)}`;
    state.equation.push(fraction);
    state.currentNumber = fraction === '1/0' ? CANNOT_DIVID_BY_0 : fraction;
    displayEquation();
  }
  if (parent.matches('[data-square]')) {
    if (state.buttons.square === true) {
      state.currentNumber = result.innerText;
    }
    if (stateOfButtons(state.buttons)) {
      state.equation.pop();
    }
    resetSecondaryOperands(state);
    state.buttons.square = true;
    if (state.currentNumber == undefined) state.currentNumber = '0';
    state.currentNumber = `sqr(${state.currentNumber})`;
    state.equation.push(state.currentNumber);
    displayEquation();
  }
  if (parent.matches('[data-square-root]')) {
    if (state.buttons.square === true) {
      state.currentNumber = result.innerText;
    }
    if (stateOfButtons(state.buttons)) {
      state.equation.pop();
    }
    resetSecondaryOperands(state);
    state.buttons.squareRoot = true;
    if (state.currentNumber == undefined) state.currentNumber = '0';
    state.currentNumber = `sqrt(${state.currentNumber})`;
    state.equation.push(state.currentNumber);
    displayEquation();
    if (isNaN(eval(state.currentNumber))) {
      state.currentNumber = INVALID_INPUT;
    }
  }
  if (parent.matches('[data-operand]')) {
    if (stateOfButtons(state.buttons) && state.equation.length > 1) {
      state.currentNumber = String(eval(state.equation.join('')));
      state.equation.push('=');
      state.history.push({ equation: state.equation, result: state.currentNumber });
      displayResult();
      displayHistory();
      state.equation = [];
      state.buttons = { percent: false, fraction: false, square: false, squareRoot: false };
    }
    if (stateOfButtons(state.buttons)) {
      state.equation.pop();
    }
    if (state.equals === true) {
      state.currentNumber = result.innerText;
      state.equals = false;
    }
    if (isOperand(state.equation)) {
      state.equation.splice(state.equation.length - 1, 1, parent.dataset.operand);
      displayEquation();
      return;
    }
    if (state.currentNumber == undefined) state.currentNumber = result.innerText;
    if (isOperand(state.equation) && state.currentNumber != undefined) {
      state.equation.push(state.currentNumber);
      doCalculation();
      state.equation.push('=');
      state.history.push({ equation: state.equation, result: state.currentNumber });
      displayHistory();
      state.calculated = false;
      state.equation = [];
      displayResult();
    }
    resetSecondaryOperands(state);
    state.equation.push(state.currentNumber, parent.dataset.operand);
    displayEquation();
    state.currentNumber = undefined;
    return;
  }
  if (parent.matches('[data-negate]')) {
    const negated = negate(state.currentNumber);
    state.currentNumber = String(negated);
    if (stateOfButtons(state.buttons)) {
      state.equation.splice(state.equation.length - 1, 1, state.currentNumber);
      displayEquation();
    }
  }
  if (parent.matches('[data-decimal]')) {
    if (state.currentNumber == undefined) state.currentNumber = '0';
    if (hasDecimal(state.currentNumber)) return;
    state.currentNumber = `${state.currentNumber}.`;
  }
  if (parent.matches('[data-equals]')) {
    if (state.equation.length === 0) {
      state.equation.push('0');
    }
    resetSecondaryOperands(state);
    state.equals = true;
    if (isOperand(state.equation) && state.currentNumber != undefined) {
      state.equation.push(state.currentNumber);
    }
    if (state.currentNumber == undefined && isOperand(state.equation)) {
      state.equation.push(result.innerText);
    }
    doCalculation();
    displayEquation();
    if (state.currentNumber === Infinity) state.currentNumber = CANNOT_DIVID_BY_0;
    if (state.currentNumber != CANNOT_DIVID_BY_0) {
      state.history.push({ equation: state.equation, result: state.currentNumber });
      displayHistory();
    }
  }
  if (parent.matches('[data-delete]')) {
    const tab = document.querySelector('.active');
    if (tab.classList[0] === 'history') {
      state.history = [];
    }
    if (tab.classList[0] === 'memory') {
      state.memory = undefined;
    }
    displayHistory();
    displayMemory();
    toggleDeleteButton();
    return;
  }
  toggleMemoryButtons();
  if (toggleTabButtons(parent)) return;
  toggleDeleteButton();
  toggleButtons();
  displayResult();
  if (state.equals === true) {
    clearState(state);
  }
});

//Functions for displaying and hidding buttons
function toggleMemoryButtons() {
  const memoryClear = document.querySelector('[data-memory-clear]');
  const memoryRecall = document.querySelector('[data-memory-recall]');

  if (state.memory == null) {
    memoryClear.style.pointerEvents = 'none';
    memoryClear.style.opacity = 0.4;

    memoryRecall.style.pointerEvents = 'none';
    memoryRecall.style.opacity = 0.4;
    return;
  }
  memoryClear.style.pointerEvents = 'all';
  memoryClear.style.opacity = 1;

  memoryRecall.style.pointerEvents = 'all';
  memoryRecall.style.opacity = 1;
}
function toggleTabButtons(button) {
  if (button.matches('[data-history]') || button.matches('[data-memory')) {
    if (button.classList.contains('active-tab')) return false;
    const historyBtn = document.querySelector('[data-history');
    const memoryBtn = document.querySelector('[data-memory');

    historyBtn.classList.toggle('active-tab');
    memoryBtn.classList.toggle('active-tab');

    document.querySelector('.history').classList.toggle('active');
    document.querySelector('.memory').classList.toggle('active');
    return true;
  }
  return false;
}
function toggleDeleteButton() {
  if (historyElement.classList.contains('active') && state.history.length > 0) {
    deleteBtn.style.opacity = '1';
    return;
  }
  if (memoryElement.classList.contains('active') && state.memory != undefined) {
    deleteBtn.style.opacity = '1';
    return;
  }
  deleteBtn.style.opacity = '0';
}
function toggleButtons() {
  if (state.currentNumber !== CANNOT_DIVID_BY_0 && state.currentNumber !== INVALID_INPUT) return;
  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {
    if (button.matches('.memory-button')) {
      button.classList.toggle('not-usable');
    }
    if (button.matches('[data-operand')) {
      button.classList.toggle('not-usable');
    }
    if (
      button.matches('[data-percent]') ||
      button.matches('[data-fraction]') ||
      button.matches('[data-square]') ||
      button.matches('[data-square-root]')
    ) {
      button.classList.toggle('not-usable');
    }
  });
}
//Functions for displaying results and equations
function displayResult() {
  if (state.currentNumber === undefined) {
    result.innerText = 0;
    return;
  }
  if (state.currentNumber === CANNOT_DIVID_BY_0 || state.currentNumber === INVALID_INPUT) {
    result.innerText = state.currentNumber;
    return;
  }
  result.innerText = eval(state.currentNumber);
}
function displayEquation() {
  if (state.equals === true) {
    state.equation.push('=');
  }

  equation.innerText = state.equation.join(' ');
}
//Functions for displaying and changing memory
function changeMemory(numStr) {
  const memoryItem = memoryElement.firstChild.firstChild;
  if (memoryItem == undefined) {
    state.memory = Number(numStr) || 0;
    displayMemory();
    return;
  }
  memoryItem.innerText = state.memory;
}
function displayMemory() {
  if (state.memory == undefined) {
    memoryElement.innerHTML = `<h3>There's no memory yet</h3>`;
    return;
  }
  if (!elementIsNotEmpty(memoryElement)) {
    memoryElement.innerHTML = '';
  }
  const memoryItem = document.createElement('div');
  const item = document.createElement('h2');
  item.innerText = state.memory;
  memoryItem.append(item);
  memoryItem.addEventListener('click', e => {
    const parent = e.target.closest('div');
    state.currentNumber = Number(parent.innerText);
    displayResult();
  });
  memoryItem.style.height = '10%';
  memoryElement.prepend(memoryItem);
}
//Functions for displaying and changing history
function displayHistory() {
  if (state.currentNumber === CANNOT_DIVID_BY_0 || state.currentNumber === INVALID_INPUT) return;
  if (state.history.length === 0) {
    historyElement.innerHTML = `<h3>There's no history yet</h3>`;
    return;
  }
  if (!elementIsNotEmpty(historyElement)) {
    historyElement.innerHTML = '';
  }
  const item = state.history[state.history.length - 1];
  const historyItem = document.createElement('div');
  historyItem.innerHTML = `<h3 class='equation'>${item.equation.join(' ')}</h3><h2>${item.result}</h2>`;
  historyElement.prepend(historyItem);
}
//Functions for increasing and decreasing the number of digits a number has
function increaseDigits(number) {
  if (state.currentNumber == undefined) {
    state.currentNumber = number;
    return;
  }
  state.currentNumber = `${state.currentNumber}${number}`;
}
function decreaseDigits() {
  const currentNumberAsArray = String(state.currentNumber).split('');
  currentNumberAsArray.splice(currentNumberAsArray.length - 1, 1);
  state.currentNumber = currentNumberAsArray.join('');
  if (state.currentNumber === '') state.currentNumber = undefined;
}
//Functions for evaluating state.equation
function doCalculation() {
  const answer = eval(state.equation.join(''));
  state.currentNumber = answer === Infinity ? CANNOT_DIVID_BY_0 : String(answer);
  if (state.currentNumber !== CANNOT_DIVID_BY_0) {
    state.calculated = true;
    return;
  }
  state.calculated = false;
}
//Function for evaluating the string 'sqr(number)'
function sqr(number) {
  return number * number;
}
//Functiun for evaluating the string 'negate(number)'
function negate(number) {
  return 0 - eval(number);
}
//Function for evaluation the string 'sqrt(number)'
function sqrt(number) {
  return Math.sqrt(number);
}
