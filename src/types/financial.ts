export type CurrencyCode = 'USD' | 'PKR' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'AED' | 'SAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  { code: 'PKR', symbol: 'Rs ', name: 'Pakistani Rupee (PKR)', locale: 'en-PK' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', locale: 'en-AU' },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham (AED)', locale: 'en-AE' },
  { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal (SAR)', locale: 'en-SA' },
];

export type CalculatorId =
  | 'mortgage'
  | 'loan'
  | 'investment'
  | 'auto-loan'
  | 'retirement'
  | 'amortization'
  | 'inflation'
  | 'salary';

export interface CalculatorMeta {
  id: CalculatorId;
  name: string;
  shortDesc: string;
  category: 'Mortgage & Housing' | 'Loans & Debt' | 'Investing & Growth' | 'Retirement & Life';
  icon: string;
}

export interface AmortizationPeriod {
  period: number;
  label: string;
  payment: number;
  principal: number;
  interest: number;
  totalInterest: number;
  remainingBalance: number;
  extraPayment?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  tertiaryValue?: number;
}

export interface CalculationHistoryItem {
  id: string;
  calculatorId: CalculatorId;
  calculatorTitle: string;
  timestamp: number;
  currency: CurrencyCode;
  primarySummary: string;
  subSummary: string;
  inputs: Record<string, any>;
}
