export function clearState(state) {
  state.currentNumber = undefined;
  state.equation = [];
  state.calculated = false;
  state.equals = false;
  state.buttons = { percent: false, fraction: false, square: false, squareRoot: false };
}
export function hasDecimal(number) {
  const numStr = String(number);
  if (numStr.split('').includes('.')) return true;
  return false;
}
export function elementIsNotEmpty(element) {
  let boolean = false;
  for (let i = 0; i < element.children.length; i++) {
    if (!element.children[i].matches('div')) {
      continue;
    }
    boolean = true;
  }
  return boolean;
}
export function isOperand(equation) {
  let boolean = false;
  const OPERANDS = ['+', '-', '*', '/'];
  for (let i = 0; i < OPERANDS.length; i++) {
    if (OPERANDS[i] === equation[equation.length - 1]) {
      boolean = true;
    }
  }
  return boolean;
}
export function resetSecondaryOperands(state) {
  state.square = false;
  state.fraction = false;
  state.percent = false;
  state.squareRoot = false;
}
export function stateOfButtons(buttons) {
  if (buttons.percent === true) return true;
  if (buttons.square === true) return true;
  if (buttons.fraction === true) return true;
  if (buttons.squareRoot === true) return true;
  return false;
}
