import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, FileDown } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateAutoLoan, AutoLoanInput } from '../../utils/calculations';
import { formatCurrency, getCurrencyConfig } from '../../utils/formatters';
import { SvgDonutChart } from '../common/SvgDonutChart';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface AutoLoanCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: AutoLoanInput;
}

const DEFAULT_AUTO: AutoLoanInput = {
  vehiclePrice: 35000,
  loanTermMonths: 60,
  interestRate: 6.9,
  cashDown: 5000,
  tradeInValue: 4000,
  tradeInOwed: 0,
  salesTaxPercent: 7.0,
  dealershipFees: 800,
};

export const AutoLoanCalculator: React.FC<AutoLoanCalculatorProps> = ({
  currency,
  isReportOpen: externalReportOpen,
  onCloseReport: externalCloseReport,
  onOpenReport: externalOpenReport,
  restoredInput,
}) => {
  const [internalReportOpen, setInternalReportOpen] = useState(false);
  const isReportOpen = externalReportOpen !== undefined ? externalReportOpen : internalReportOpen;
  const handleOpenReport = externalOpenReport || (() => setInternalReportOpen(true));
  const handleCloseReport = externalCloseReport || (() => setInternalReportOpen(false));

  const [input, setInput] = useState<AutoLoanInput>(DEFAULT_AUTO);
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations
  useEffect(() => {
    if (restoredInput) {
      setInput(restoredInput);
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateAutoLoan(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'auto-loan',
        calculatorTitle: 'Auto Loan',
        currency,
        primarySummary: `${formatCurrency(result.monthlyPayment, currency)} / mo`,
        subSummary: `${formatCurrency(input.vehiclePrice, currency)} car · ${input.loanTermMonths} Mos · ${input.interestRate}%`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.monthlyPayment, currency]);

  const donutSlices = [
    {
      label: 'Vehicle Financed',
      value: result.totalFinanced,
      color: '#4f46e5',
    },
    {
      label: 'Total Interest',
      value: result.totalInterest,
      color: '#f43f5e',
    },
    {
      label: 'Sales Tax',
      value: result.salesTaxAmount,
      color: '#0ea5e9',
    },
    {
      label: 'Fees & Documentation',
      value: input.dealershipFees,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Auto Loan & Vehicle Financing Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate your monthly car payment, including trade-in equity, cash down, sales taxes, and dealer fees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Report as PDF Button */}
          <button
            onClick={handleOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            title="Download formatted statement as PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Report as PDF</span>
          </button>

          <span className="text-xs text-slate-500 font-medium ml-1">Presets:</span>
          <button
            onClick={() =>
              setInput({
                vehiclePrice: 42000,
                loanTermMonths: 60,
                interestRate: 5.9,
                cashDown: 6000,
                tradeInValue: 8000,
                tradeInOwed: 0,
                salesTaxPercent: 7,
                dealershipFees: 750,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            New Car ($42k)
          </button>
          <button
            onClick={() =>
              setInput({
                vehiclePrice: 22000,
                loanTermMonths: 48,
                interestRate: 7.9,
                cashDown: 3000,
                tradeInValue: 0,
                tradeInOwed: 0,
                salesTaxPercent: 6.5,
                dealershipFees: 500,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            Used Car ($22k)
          </button>
          <button
            onClick={() => setInput(DEFAULT_AUTO)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Purchase Details
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={input.vehiclePrice || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, vehiclePrice: Math.max(0, parseFloat(e.target.value) || 0) }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Loan Term</label>
              <select
                value={input.loanTermMonths}
                onChange={(e) =>
                  setInput((p) => ({ ...p, loanTermMonths: parseInt(e.target.value, 10) }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={36}>36 Months (3 yrs)</option>
                <option value={48}>48 Months (4 yrs)</option>
                <option value={60}>60 Months (5 yrs)</option>
                <option value={72}>72 Months (6 yrs)</option>
                <option value={84}>84 Months (7 yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Interest Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="35"
                  step="0.1"
                  value={input.interestRate || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, interestRate: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cash Down Payment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="250"
                  value={input.cashDown || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, cashDown: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Trade-in Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="250"
                  value={input.tradeInValue || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, tradeInValue: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sales Tax (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={input.salesTaxPercent || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, salesTaxPercent: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Title & Dealer Fees</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={input.dealershipFees || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, dealershipFees: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Monthly Payment
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                  {formatCurrency(result.monthlyPayment, currency)}
                  <span className="text-sm font-normal text-slate-500"> / mo</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Total Amount Financed:</span>
                <p className="text-base font-semibold text-slate-800 font-mono tabular-nums">
                  {formatCurrency(result.totalFinanced, currency)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Interest</span>
                <span className="text-sm font-semibold text-rose-600 font-mono tabular-nums">
                  {formatCurrency(result.totalInterest, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Purchase Cost</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.totalCost, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Sales Tax Paid</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.salesTaxAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Net Trade-in Equity</span>
                <span className="text-sm font-semibold text-emerald-600 font-mono tabular-nums">
                  {formatCurrency(result.netTradeIn, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Vehicle Cost Breakdown
            </h3>
            <SvgDonutChart slices={donutSlices} currency={currency} title="Total Cost" />
          </div>
        </div>
      </div>

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="Auto Loan & Financing Analysis"
        currency={currency}
        metrics={[
          {
            label: 'Monthly Car Payment',
            value: `${formatCurrency(result.monthlyPayment, currency)} / mo`,
            isPrimary: true,
          },
          {
            label: 'Total Amount Financed',
            value: formatCurrency(result.totalFinanced, currency),
          },
          {
            label: 'Total Interest Paid',
            value: formatCurrency(result.totalInterest, currency),
          },
          {
            label: 'Total Vehicle Cost',
            value: formatCurrency(result.totalCost, currency),
            subtext: `${input.loanTermMonths} Months (${(input.loanTermMonths / 12).toFixed(1)} Yrs)`,
          },
        ]}
        parameters={[
          { label: 'Vehicle Purchase Price', value: formatCurrency(input.vehiclePrice, currency) },
          { label: 'Cash Down Payment', value: formatCurrency(input.cashDown, currency) },
          { label: 'Trade-in Value', value: formatCurrency(input.tradeInValue, currency) },
          { label: 'Amount Owed on Trade-in', value: formatCurrency(input.tradeInOwed, currency) },
          { label: 'Net Trade-in Equity', value: formatCurrency(result.netTradeIn, currency) },
          { label: 'Loan Term', value: `${input.loanTermMonths} Months` },
          { label: 'Interest Rate', value: `${input.interestRate}%` },
          { label: 'Sales Tax Rate', value: `${input.salesTaxPercent}% (${formatCurrency(result.salesTaxAmount, currency)})` },
          { label: 'Dealer & Title Fees', value: formatCurrency(input.dealershipFees, currency) },
        ]}
        charts={{
          donut: {
            title: 'Vehicle Financing Breakdown',
            slices: donutSlices,
          },
        }}
      />
    </div>
  );
};
