export default function test(state) {
  if (state.equation.length === 3 && state.result == undefined && state.calculated === true) {
    console.log('Test: true');
    return;
  }
  console.log('Test: false');
}
