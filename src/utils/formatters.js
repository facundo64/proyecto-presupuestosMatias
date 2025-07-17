// src/utils/formatters.js

/**
 * @param {number} number - El número
 * @param {string} currency - La moneda.
 * @returns {string}
 */
export const formatPrice = (number, currency) => {
  const numberValue = parseFloat(number) || 0;

  if (currency === 'USD') {

    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
    return `U$S ${formattedNumber}`;
  }
  

  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
  return `$ ${formattedNumber}`;
};