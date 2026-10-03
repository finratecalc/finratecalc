import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, FileDown, Download } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateLoan, LoanInput } from '../../utils/calculations';
import { formatCurrency, getCurrencyConfig, exportToCSV } from '../../utils/formatters';
import { SvgDonutChart } from '../common/SvgDonutChart';
import { SvgLineAreaChart } from '../common/SvgLineAreaChart';
import { AmortizationTable } from '../common/AmortizationTable';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface LoanCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: LoanInput;
}

const DEFAULT_LOAN: LoanInput = {
  loanAmount: 25000,
  loanTermMonths: 36,
  interestRate: 8.5,
  frequency: 'monthly',
};

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
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

  const [input, setInput] = useState<LoanInput>(DEFAULT_LOAN);
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations or top benchmark ticker
  useEffect(() => {
    if (restoredInput) {
      setInput((prev) => ({ ...prev, ...restoredInput }));
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateLoan(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'loan',
        calculatorTitle: 'Personal Loan',
        currency,
        primarySummary: `${formatCurrency(result.paymentPerPeriod, currency)} / ${input.frequency === 'monthly' ? 'mo' : input.frequency}`,
        subSummary: `${formatCurrency(input.loanAmount, currency)} · ${input.loanTermMonths} Mos · ${input.interestRate}%`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.paymentPerPeriod, currency]);

  const donutSlices = [
    {
      label: 'Principal Loan Amount',
      value: input.loanAmount,
      color: '#4f46e5',
    },
    {
      label: 'Total Interest',
      value: result.totalInterestPaid,
      color: '#f43f5e',
    },
  ];

  // Sample schedule for chart
  const step = Math.max(1, Math.floor(result.schedule.length / 20));
  const chartLabels = result.schedule
    .filter((_, idx) => idx % step === 0 || idx === result.schedule.length - 1)
    .map((s) => s.label);
  const chartBalances = result.schedule
    .filter((_, idx) => idx % step === 0 || idx === result.schedule.length - 1)
    .map((s) => s.remainingBalance);

  const handleExportCSV = () => {
    const headers = [
      'Period',
      `Payment (${currency})`,
      `Principal (${currency})`,
      `Interest (${currency})`,
      `Total Interest (${currency})`,
      `Remaining Balance (${currency})`,
    ];
    const rows = result.schedule.map((d) => [
      d.label,
      d.payment.toFixed(2),
      d.principal.toFixed(2),
      d.interest.toFixed(2),
      d.totalInterest.toFixed(2),
      d.remainingBalance.toFixed(2),
    ]);
    exportToCSV(`fincalc-loan-amortization-${input.loanTermMonths}months`, [headers, ...rows]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Personal & Term Loan Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate payment amounts, total interest, and complete payoff schedules for any fixed-rate loan.
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

          {/* Export Amortization CSV for Excel Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Export full amortization schedule as CSV spreadsheet for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <span className="text-xs text-slate-500 font-medium ml-1">Presets:</span>
          <button
            onClick={() =>
              setInput({
                loanAmount: 10000,
                loanTermMonths: 24,
                interestRate: 7.9,
                frequency: 'monthly',
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            $10k 2-Yr (7.9%)
          </button>
          <button
            onClick={() =>
              setInput({
                loanAmount: 35000,
                loanTermMonths: 60,
                interestRate: 9.5,
                frequency: 'monthly',
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            $35k 5-Yr (9.5%)
          </button>
          <button
            onClick={() => setInput(DEFAULT_LOAN)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Loan Terms
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={input.loanAmount || ''}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    loanAmount: Math.max(0, parseFloat(e.target.value) || 0),
                  }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Term (Months)</label>
              <input
                type="number"
                min="1"
                max="360"
                value={input.loanTermMonths || ''}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    loanTermMonths: Math.max(1, parseInt(e.target.value, 10) || 1),
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {(input.loanTermMonths / 12).toFixed(1)} years
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Interest Rate (%)</label>
                <button
                  type="button"
                  onClick={() => setInput((prev) => ({ ...prev, interestRate: 8.0 }))}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                  title="Apply US Fed Prime Rate (8.00%)"
                >
                  Prime: 8.00%
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={input.interestRate || ''}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      interestRate: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Payment Frequency</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              {(['monthly', 'biweekly', 'weekly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setInput((p) => ({ ...p, frequency: freq }))}
                  className={`py-2 px-2 text-center rounded-lg border capitalize transition-colors ${
                    input.frequency === freq
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment Every {input.frequency === 'biweekly' ? '2 Weeks' : input.frequency}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                  {formatCurrency(result.paymentPerPeriod, currency)}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Total Payments:</span>
                <p className="text-base font-semibold text-slate-800 font-mono tabular-nums">
                  {result.numberOfPayments} payments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Interest Paid</span>
                <span className="text-sm font-semibold text-rose-600 font-mono tabular-nums">
                  {formatCurrency(result.totalInterestPaid, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Repayment</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.totalPaymentsAmount, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Interest to Principal Ratio</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {input.loanAmount > 0
                    ? ((result.totalInterestPaid / input.loanAmount) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Principal vs. Interest Breakdown
            </h3>
            <SvgDonutChart slices={donutSlices} currency={currency} title="Total Cost" />
          </div>
        </div>
      </div>

      {/* Payoff Curve */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Loan Balance Trajectory
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Visualizing remaining loan balance as each installment is repaid.
        </p>
        <SvgLineAreaChart
          xLabels={chartLabels}
          series={[
            {
              id: 'loan-balance',
              name: 'Remaining Debt',
              color: '#4f46e5',
              data: chartBalances,
            },
          ]}
          currency={currency}
          height={240}
        />
      </div>

      {/* Schedule Table */}
      <AmortizationTable
        annualSchedule={result.schedule}
        monthlySchedule={result.schedule}
        currency={currency}
        title="Repayment Schedule"
      />

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="Personal Loan Analysis"
        currency={currency}
        metrics={[
          {
            label: `Payment (${input.frequency})`,
            value: formatCurrency(result.paymentPerPeriod, currency),
            isPrimary: true,
          },
          {
            label: 'Total Loan Amount',
            value: formatCurrency(input.loanAmount, currency),
          },
          {
            label: 'Total Interest Paid',
            value: formatCurrency(result.totalInterestPaid, currency),
          },
          {
            label: 'Total Repayment Cost',
            value: formatCurrency(result.totalPaymentsAmount, currency),
            subtext: `${result.numberOfPayments} payments`,
          },
        ]}
        parameters={[
          { label: 'Principal Loan Amount', value: formatCurrency(input.loanAmount, currency) },
          { label: 'Term in Months', value: `${input.loanTermMonths} Months (${(input.loanTermMonths / 12).toFixed(1)} Yrs)` },
          { label: 'Interest Rate', value: `${input.interestRate}%` },
          { label: 'Payment Frequency', value: input.frequency },
          { label: 'Total Number of Payments', value: `${result.numberOfPayments}` },
        ]}
        charts={{
          donut: {
            title: 'Principal vs Total Interest',
            slices: donutSlices,
          },
          trajectory: {
            title: 'Loan Payoff Trajectory',
            subtitle: 'Remaining balance over time',
            xLabels: chartLabels,
            series: [
              {
                id: 'loan-balance',
                name: 'Remaining Debt',
                color: '#4f46e5',
                data: chartBalances,
              },
            ],
          },
        }}
        annualSchedule={result.schedule}
      />
    </div>
  );
};
