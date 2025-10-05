export const formatCurrency = (value: number): string => {
  return `$${Math.round(value).toLocaleString()}`;
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatNumber = (value: number): string => {
  return Math.round(value).toLocaleString();
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[$,]/g, ''));
};
