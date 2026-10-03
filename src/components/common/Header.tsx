import React from 'react';
import { Globe, Printer, Shield, Sparkles } from 'lucide-react';
import { CalculatorId, CurrencyCode, SUPPORTED_CURRENCIES, CalculationHistoryItem } from '../../types/financial';
import { RecentCalculationsDropdown } from './RecentCalculationsDropdown';
import { MarketBenchmarksBar } from './MarketBenchmarksBar';
import { MarketBenchmark } from '../../services/marketRatesService';

interface HeaderProps {
  activeCalculator: CalculatorId | 'directory';
  onSelectCalculator: (id: CalculatorId | 'directory') => void;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  onOpenReport?: () => void;
  onRestoreCalculation?: (item: CalculationHistoryItem) => void;
  onApplyBenchmark?: (benchmark: MarketBenchmark) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCalculator,
  onSelectCalculator,
  currency,
  onCurrencyChange,
  onOpenReport,
  onRestoreCalculation,
  onApplyBenchmark,
}) => {
  return (
    <>
      {/* Top Regional Market Rates Ticker Bar */}
      <MarketBenchmarksBar
        currency={currency}
        onSelectCalculator={(id) => onSelectCalculator(id)}
        onApplyBenchmark={onApplyBenchmark}
      />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Wordmark */}
          <button
            onClick={() => onSelectCalculator('directory')}
            className="flex items-center gap-2 group text-left shrink-0"
            title="FinRateCalc.com - Precision Financial Calculators"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Shield className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  FinRate<span className="text-emerald-600">Calc</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">
                  .com
                </span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                US Financial Tools
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectCalculator('mortgage')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'mortgage'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              Mortgage
            </button>
            <button
              onClick={() => onSelectCalculator('loan')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'loan'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              Loans
            </button>
            <button
              onClick={() => onSelectCalculator('investment')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'investment'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              Investment
            </button>
            <button
              onClick={() => onSelectCalculator('auto-loan')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'auto-loan'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              Auto Loan
            </button>
            <button
              onClick={() => onSelectCalculator('retirement')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'retirement'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              401(k)
            </button>
            <button
              onClick={() => onSelectCalculator('salary')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'salary'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              Take-Home Pay
            </button>
            <button
              onClick={() => onSelectCalculator('directory')}
              className={`transition-colors hover:text-slate-900 whitespace-nowrap py-1 ${
                activeCalculator === 'directory'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 -mb-1'
                  : ''
              }`}
            >
              All 8 Calculators
            </button>
          </nav>

          {/* Zone 3: Recent, Currency & PDF actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Recent Calculations Dropdown Menu */}
            {onRestoreCalculation && (
              <RecentCalculationsDropdown onRestoreCalculation={onRestoreCalculation} />
            )}

            {/* Currency Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="pl-7 pr-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
                title="Change Currency"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Download PDF Report Button */}
            {onOpenReport && activeCalculator !== 'directory' ? (
              <button
                onClick={onOpenReport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
                title="Generate and Download PDF Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF Report</span>
              </button>
            ) : (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                title="Print view"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
