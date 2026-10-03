import { CurrencyCode, SUPPORTED_CURRENCIES } from '../types/financial';

export function getCurrencyConfig(code: CurrencyCode) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
  showDecimals = true
): string {
  if (isNaN(amount) || !isFinite(amount)) return '0.00';
  const config = getCurrencyConfig(currencyCode);
  
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `${config.symbol}${formattedNumber}`;
}

export function formatNumber(value: number, decimals = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function parseNumberInput(val: string): number {
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) =>
    row
      .map((val) => {
        let stringVal = val === null || val === undefined ? '' : val.toString();
        if (stringVal.search(/("|,|\n|\r)/g) >= 0) {
          stringVal = `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      })
      .join(',');

  const csvString = rows.map(processRow).join('\r\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
