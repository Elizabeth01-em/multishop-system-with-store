/**
 * Format currency values for display
 * @param amount - The amount to format
 * @returns Formatted currency string in Tanzanian Shillings
 */
export function formatCurrency(amount: number | string): string {
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format as Tanzanian Shillings (TZS)
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Format currency without the currency symbol for internal calculations
 * @param amount - The amount to format
 * @returns Formatted number string with 2 decimal places
 */
export function formatCurrencyNumber(amount: number | string): string {
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return numericAmount.toFixed(2);
}