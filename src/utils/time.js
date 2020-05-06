export default function time(name = '<unknown>', operation) {
  // immediately call without wrapper if window or performance are unavialable
  if (!process.browser) {
    return operation();
  }

  // client-side-only code

  const start = window.performance.now();
  const result = operation();
  const elapsedMs = performance.now() - start;
  console.debug(name, 'time', humanTime(elapsedMs));
  return { result, elapsedMs };
}

function humanTime(milliseconds) {
  // µs = 1000ms
  if (milliseconds < 1) {
    return [Math.round(milliseconds * 1000), 'µs'];
  } else if (milliseconds > 1000) {
    return [+(milliseconds / 1000).toFixed(3), 's'];
  }

  return [Math.round(milliseconds), 'ms'];
}

// console.debug(humanTime(3581));
// console.debug(humanTime(0.287));
// console.debug(humanTime(0.287999));
// console.debug(humanTime(0.286999));
// console.debug(humanTime(0.286444));
// console.debug(humanTime(489));
// console.debug(humanTime(999));
// console.debug(humanTime(1000));
// console.debug(humanTime(1001));
