// getDate function
getDate = function getDate(input) {
  return new Date(input);
};

// convertString function
function convertString(input) {
  if (/\D/.test(input)) {
    return getDate(input);
  }
  else if (!/\D/.test(input)) {
    return getDate(Number(input));
  }
};

// getUTCString
module.exports.getUTCString = function getUTCString(input) {
    return convertString(input).toUTCString();
};

// getUnixString
module.exports.getUnixString = function getUnixString(input) {
  return Date.parse(convertString(input));
};