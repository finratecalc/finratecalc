import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, FileDown } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateSalary, SalaryInput } from '../../utils/calculations';
import { formatCurrency, formatPercent, getCurrencyConfig } from '../../utils/formatters';
import { SvgDonutChart } from '../common/SvgDonutChart';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface SalaryCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: SalaryInput;
}

const DEFAULT_SALARY: SalaryInput = {
  grossSalary: 85000,
  payPeriod: 'annually',
  hoursPerWeek: 40,
  federalTaxPercent: 14.5,
  stateTaxPercent: 4.5,
  deductionsAnnual: 4000,
};

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
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

  const [input, setInput] = useState<SalaryInput>(DEFAULT_SALARY);
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations
  useEffect(() => {
    if (restoredInput) {
      setInput(restoredInput);
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateSalary(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'salary',
        calculatorTitle: 'Salary & Take-Home Pay',
        currency,
        primarySummary: `${formatCurrency(result.monthlyNet, currency)} / mo net`,
        subSummary: `${formatCurrency(result.annualGross, currency)} gross · ${result.effectiveTaxRate.toFixed(1)}% tax`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.monthlyNet, currency]);

  const donutSlices = [
    {
      label: 'Net Take-Home Pay',
      value: result.annualNet,
      color: '#10b981', // emerald
    },
    {
      label: 'Taxes (Income & FICA)',
      value: result.totalTax,
      color: '#f43f5e', // rose
    },
    ...(input.deductionsAnnual > 0
      ? [{ label: 'Pre-Tax Deductions', value: input.deductionsAnnual, color: '#6366f1' }]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Salary & Take-Home Pay Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Convert annual, monthly, or hourly earnings into estimated net take-home pay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Report as PDF Button */}
          <button
            onClick={handleOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            title="Download formatted statement as PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Report as PDF</span>
          </button>

          <button
            onClick={() => setInput(DEFAULT_SALARY)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors ml-1"
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
            Compensation Details
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Gross Wage / Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={input.grossSalary || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, grossSalary: Math.max(0, parseFloat(e.target.value) || 0) }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pay Period</label>
              <select
                value={input.payPeriod}
                onChange={(e) =>
                  setInput((p) => ({
                    ...p,
                    payPeriod: e.target.value as 'annually' | 'monthly' | 'biweekly' | 'hourly',
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="annually">Per Year</option>
                <option value="monthly">Per Month</option>
                <option value="biweekly">Every 2 Weeks</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Hours / Week</label>
              <input
                type="number"
                min="1"
                max="100"
                value={input.hoursPerWeek || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, hoursPerWeek: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pt-2 pb-2">
            Tax & Deduction Estimates
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Federal Tax (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  value={input.federalTaxPercent || ''}
                  onChange={(e) =>
                    setInput((p) => ({
                      ...p,
                      federalTaxPercent: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">State / Local (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={input.stateTaxPercent || ''}
                  onChange={(e) =>
                    setInput((p) => ({
                      ...p,
                      stateTaxPercent: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Annual Pre-Tax Deductions (401k, Health)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="250"
                value={input.deductionsAnnual || ''}
                onChange={(e) =>
                  setInput((p) => ({
                    ...p,
                    deductionsAnnual: Math.max(0, parseFloat(e.target.value) || 0),
                  }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Net Monthly Take-Home Pay
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
                  {formatCurrency(result.monthlyNet, currency)}
                  <span className="text-sm font-normal text-slate-500"> / mo</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Annual Net:</span>
                <p className="text-base font-semibold text-slate-800 font-mono tabular-nums">
                  {formatCurrency(result.annualNet, currency)}
                </p>
              </div>
            </div>

            {/* Breakdown per period */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500 block">Bi-Weekly Paycheck</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.biweeklyNet, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Weekly Paycheck</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.weeklyNet, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Effective Hourly</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.hourlyNet, currency)}/hr
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Effective Tax Rate</span>
                <span className="text-sm font-semibold text-rose-600 font-mono tabular-nums">
                  {formatPercent(result.effectiveTaxRate, 1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Gross Earnings Distribution
            </h3>
            <SvgDonutChart slices={donutSlices} currency={currency} title="Gross Salary" />
          </div>
        </div>
      </div>

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="Salary & Take-Home Pay Analysis"
        currency={currency}
        metrics={[
          {
            label: 'Net Monthly Take-Home',
            value: `${formatCurrency(result.monthlyNet, currency)} / mo`,
            isPrimary: true,
          },
          {
            label: 'Annual Net Take-Home',
            value: formatCurrency(result.annualNet, currency),
          },
          {
            label: 'Total Estimated Taxes',
            value: formatCurrency(result.totalTax, currency),
            subtext: `${result.effectiveTaxRate.toFixed(1)}% Effective Rate`,
          },
          {
            label: 'Bi-Weekly Paycheck',
            value: formatCurrency(result.biweeklyNet, currency),
            subtext: `${formatCurrency(result.hourlyNet, currency)}/hr`,
          },
        ]}
        parameters={[
          { label: 'Gross Annualized Salary', value: formatCurrency(result.annualGross, currency) },
          { label: 'Base Pay Period', value: input.payPeriod },
          { label: 'Hours Per Week', value: `${input.hoursPerWeek} hrs/wk` },
          { label: 'Estimated Federal Tax', value: `${input.federalTaxPercent}%` },
          { label: 'Estimated State / Local Tax', value: `${input.stateTaxPercent}%` },
          { label: 'FICA (Social Security & Medicare)', value: '7.65%' },
          { label: 'Annual Pre-Tax Deductions', value: formatCurrency(input.deductionsAnnual, currency) },
        ]}
        charts={{
          donut: {
            title: 'Earnings Breakdown (Net vs Taxes)',
            slices: donutSlices,
          },
        }}
      />
    </div>
  );
};
