/**
 * Calculates age from birthdate
 */
export const calculateAge = (birthdate: string | Date): number | string => {
  try {
    const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return 'N/A';
  }
};

/**
 * Formats a dollar value with commas and $ sign
 */
export const formatCurrency = (value: number): string => {
  // Check if it's a dollar index (typically a small number with decimals)
  if (value < 10) {
    return `$${value.toFixed(2)}`;
  }
  
  // For larger values, format with commas
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

/**
 * Formats a dollar index value (between 0 and 5)
 */
export const formatDollarIndex = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

/**
 * Formats a dollar value with commas, $ sign, and 2 decimal places
 */
export const formatCurrencyWithDecimals = (value: number): string => {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formats a percentage value
 * @param value - The percentage value (can be either 0-1 or 0-100)
 */
export const formatPercentage = (value: number): string => {
  // Check if the value is already in the 0-100 range
  const scaledValue = value > 1 ? value : value * 100;
  return `${scaledValue.toFixed(1)}%`;
};

/**
 * Formats a delivery value
 */
export const formatDeliveryValue = (value: number): string => {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(value)}`;
};

/**
 * Formats a value capture percentage
 */
export const formatValueCapturePercentage = (value: number): string => {
  if (value === null || isNaN(value)) return 'N/A';
  return `${value.toFixed(0)}%`;
};

/**
 * Formats a rank value
 */
export const formatRank = (rank: number, total: number): string => {
  // Check if rank is undefined, null, or NaN and display N/A
  if (rank === undefined || rank === null || isNaN(rank)) {
    return `N/A`;
  }
  
  // Display actual rank number as is - no manipulation
  return `#${rank}/${total}`;
}; 