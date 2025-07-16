// src/utils/formatters.js

/**
 * Formatea un número según la moneda especificada (ARS o USD).
 * @param {number} number - El número a formatear.
 * @param {string} currency - La moneda ('ARS' o 'USD').
 * @returns {string} - El precio formateado con su símbolo.
 */
export const formatPrice = (number, currency) => {
  const numberValue = parseFloat(number) || 0;

  if (currency === 'USD') {
    // Formato para Dólares (U$S 1,234.56)
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue);
    return `U$S ${formattedNumber}`;
  }
  
  // Formato por defecto para Pesos Argentinos ($ 1.234,56)
  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
  return `$ ${formattedNumber}`;
};