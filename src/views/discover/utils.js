export const rgba = (color) => {
  // Converts a hex color string to an rgba array.
  // Use either as a template tag or normal functions.
  // Alpha value is not included if hex string is 6-characters.
  const pattern = /#?([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?/i
  return pattern
    .exec(color)
    .slice(1)
    .map((v) => parseInt(v, 16))
    .filter((x) => x >= 0)
}
