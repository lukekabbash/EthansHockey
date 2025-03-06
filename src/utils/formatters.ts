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
  // If the value is between 0 and 1, it's likely a dollar index
  if (value >= 0 && value <= 1) {
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
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
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
  return `#${rank}/${total}`;
}; 