// getDate function
function getDate(input) {
  return new Date(input);
};
// convertString function
function convertString(input) {
  if (/\D/.test(input)) {
    return getDate(input);
  }
  else if (!/\D/.test(input)) {
    return getDate(Number(input));
  };
};
// getUTCString
export function getUTCString(input) {
  return convertString(input).toUTCString();
};
// getUnixString
export function getUnixString(input) {
  return Date.parse(convertString(input));
};