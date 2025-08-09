/**
 * Formats a number with commas as thousand separators
 * @param {number|string} value - The number to format
 * @param {number} [decimals=2] - Number of decimal places to show
 * @returns {string} Formatted number string with commas
 */
export const formatMoney = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '0.00';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Parses a formatted money string back to a number
 * @param {string} value - The formatted money string
 * @returns {number} The parsed number
 */
export const parseMoney = (value) => {
  if (!value) return 0;
  return parseFloat(value.replace(/,/g, ''));
};
