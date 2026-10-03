import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, TrendingUp, Download, FileDown } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateInvestment, InvestmentInput } from '../../utils/calculations';
import { formatCurrency, formatPercent, getCurrencyConfig, exportToCSV } from '../../utils/formatters';
import { SvgDonutChart } from '../common/SvgDonutChart';
import { SvgLineAreaChart } from '../common/SvgLineAreaChart';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface InvestmentCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: InvestmentInput;
}

const DEFAULT_INVESTMENT: InvestmentInput = {
  startingAmount: 10000,
  regularDeposit: 500,
  depositFrequency: 'monthly',
  interestRate: 8.0,
  compoundFrequency: 'monthly',
  years: 25,
};

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
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

  const [input, setInput] = useState<InvestmentInput>(DEFAULT_INVESTMENT);
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations or top benchmark ticker
  useEffect(() => {
    if (restoredInput) {
      setInput((prev) => ({ ...prev, ...restoredInput }));
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateInvestment(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'investment',
        calculatorTitle: 'Compound Interest',
        currency,
        primarySummary: formatCurrency(result.endBalance, currency),
        subSummary: `Init ${formatCurrency(input.startingAmount, currency)} · +${formatCurrency(input.regularDeposit, currency)}/${input.depositFrequency === 'monthly' ? 'mo' : input.depositFrequency} · ${input.years} Yrs`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.endBalance, currency]);

  const donutSlices = [
    {
      label: 'Initial Principal',
      value: result.totalPrincipal,
      color: '#6366f1', // indigo
    },
    {
      label: 'Total Deposits',
      value: result.totalContributions,
      color: '#0ea5e9', // sky
    },
    {
      label: 'Compound Interest',
      value: result.totalInterest,
      color: '#10b981', // emerald
    },
  ];

  const chartLabels = result.breakdown.map((b) => `Yr ${b.year}`);
  const chartBalances = result.breakdown.map((b) => b.endingBalance);
  const chartContributions = result.breakdown.map(
    (b) => input.startingAmount + b.year * (input.depositFrequency === 'monthly' ? input.regularDeposit * 12 : input.regularDeposit)
  );

  const handleExportCSV = () => {
    const headers = [
      'Year',
      `Starting Balance (${currency})`,
      `Annual Deposits (${currency})`,
      `Interest Earned (${currency})`,
      `Total Interest (${currency})`,
      `Ending Balance (${currency})`,
    ];
    const rows = result.breakdown.map((b) => [
      `Year ${b.year}`,
      b.startingBalance.toFixed(2),
      b.deposits.toFixed(2),
      b.interestEarned.toFixed(2),
      b.totalInterest.toFixed(2),
      b.endingBalance.toFixed(2),
    ]);
    exportToCSV(`fincalc-investment-projection-${input.years}yrs`, [headers, ...rows]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Compound Interest & Investment Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate the exponential power of compounding interest with regular contributions.
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

          {/* Export CSV for Excel Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Export investment projection as CSV spreadsheet for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <span className="text-xs text-slate-500 font-medium ml-1">Presets:</span>
          <button
            onClick={() =>
              setInput({
                startingAmount: 5000,
                regularDeposit: 400,
                depositFrequency: 'monthly',
                interestRate: 10,
                compoundFrequency: 'annually',
                years: 30,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            S&P 500 (10%)
          </button>
          <button
            onClick={() =>
              setInput({
                startingAmount: 20000,
                regularDeposit: 250,
                depositFrequency: 'monthly',
                interestRate: 4.5,
                compoundFrequency: 'monthly',
                years: 10,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            HYSA (4.5%)
          </button>
          <button
            onClick={() => setInput(DEFAULT_INVESTMENT)}
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
            Investment Parameters
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Starting Amount (Initial Principal)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={input.startingAmount || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, startingAmount: Math.max(0, parseFloat(e.target.value) || 0) }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Regular Deposit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={input.regularDeposit || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, regularDeposit: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Deposit Frequency</label>
              <select
                value={input.depositFrequency}
                onChange={(e) =>
                  setInput((p) => ({ ...p, depositFrequency: e.target.value as 'monthly' | 'annually' }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Annual Return (%)</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, interestRate: 10.2 }))}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                    title="Apply S&P 500 Historical Compound Annual Return (10.2%)"
                  >
                    S&P 500: 10.2%
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput((p) => ({ ...p, interestRate: 8.0 }))}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Apply Typical 8.0% Balanced Portfolio Return"
                  >
                    8.0%
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={input.interestRate || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, interestRate: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Time Horizon (Years)</label>
              <input
                type="number"
                min="1"
                max="80"
                value={input.years || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, years: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Compounding Interval</label>
            <select
              value={input.compoundFrequency}
              onChange={(e) =>
                setInput((p) => ({
                  ...p,
                  compoundFrequency: e.target.value as 'monthly' | 'quarterly' | 'annually' | 'daily',
                }))
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="annually">Compounded Annually</option>
              <option value="quarterly">Compounded Quarterly</option>
              <option value="monthly">Compounded Monthly</option>
              <option value="daily">Compounded Daily</option>
            </select>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Projected End Balance in {input.years} Years
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
                  {formatCurrency(result.endBalance, currency)}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Total Contributed:</span>
                <p className="text-base font-semibold text-slate-800 font-mono tabular-nums">
                  {formatCurrency(result.totalPrincipal + result.totalContributions, currency)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Interest Earned</span>
                <span className="text-sm font-semibold text-emerald-600 font-mono tabular-nums">
                  {formatCurrency(result.totalInterest, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Wealth Multiplier</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {(
                    result.endBalance /
                    Math.max(1, result.totalPrincipal + result.totalContributions)
                  ).toFixed(2)}
                  x
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Interest Share</span>
                <span className="text-sm font-semibold text-indigo-600 font-mono tabular-nums">
                  {formatPercent((result.totalInterest / Math.max(1, result.endBalance)) * 100, 1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Capital vs Interest Composition
            </h3>
            <SvgDonutChart slices={donutSlices} currency={currency} title="End Balance" />
          </div>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Wealth Growth Trajectory Over Time
            </h3>
            <p className="text-xs text-slate-500">
              Comparing total balance (with compound interest) versus total out-of-pocket contributions.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Exponential Compounding</span>
          </div>
        </div>
        <SvgLineAreaChart
          xLabels={chartLabels}
          series={[
            {
              id: 'total-balance',
              name: 'Total Balance',
              color: '#10b981',
              data: chartBalances,
            },
            {
              id: 'contributions',
              name: 'Total Contributions',
              color: '#6366f1',
              data: chartContributions,
            },
          ]}
          currency={currency}
          height={260}
        />
      </div>

      {/* Annual Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Year-by-Year Growth Schedule</h3>
            <p className="text-xs text-slate-500">Annual progression of deposits, returns, and balance.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 text-slate-600 border-b border-slate-200 sticky top-0 font-medium">
              <tr>
                <th className="py-2.5 px-4">Year</th>
                <th className="py-2.5 px-4 text-right">Start Balance</th>
                <th className="py-2.5 px-4 text-right">Annual Deposits</th>
                <th className="py-2.5 px-4 text-right">Interest Earned</th>
                <th className="py-2.5 px-4 text-right">Total Interest</th>
                <th className="py-2.5 px-4 text-right">End Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {result.breakdown.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">Year {row.year}</td>
                  <td className="py-2 px-4 text-right text-slate-600">
                    {formatCurrency(row.startingBalance, currency)}
                  </td>
                  <td className="py-2 px-4 text-right text-sky-600">
                    {formatCurrency(row.deposits, currency)}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-600 font-medium">
                    +{formatCurrency(row.interestEarned, currency)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {formatCurrency(row.totalInterest, currency)}
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-slate-900">
                    {formatCurrency(row.endingBalance, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="Investment & Compound Interest Analysis"
        currency={currency}
        metrics={[
          {
            label: `End Balance (${input.years} Yrs)`,
            value: formatCurrency(result.endBalance, currency),
            isPrimary: true,
          },
          {
            label: 'Initial Principal',
            value: formatCurrency(result.totalPrincipal, currency),
          },
          {
            label: 'Total Deposits',
            value: formatCurrency(result.totalContributions, currency),
          },
          {
            label: 'Compound Interest Earned',
            value: formatCurrency(result.totalInterest, currency),
            subtext: `${(result.endBalance / Math.max(1, result.totalPrincipal + result.totalContributions)).toFixed(2)}x Multiplier`,
          },
        ]}
        parameters={[
          { label: 'Initial Principal', value: formatCurrency(input.startingAmount, currency) },
          {
            label: 'Regular Deposit',
            value: `${formatCurrency(input.regularDeposit, currency)} (${input.depositFrequency})`,
          },
          { label: 'Annual Interest Return', value: `${input.interestRate}%` },
          { label: 'Compounding Interval', value: input.compoundFrequency },
          { label: 'Investment Time Horizon', value: `${input.years} Years` },
          {
            label: 'Total Capital Contributed',
            value: formatCurrency(result.totalPrincipal + result.totalContributions, currency),
          },
        ]}
        charts={{
          donut: {
            title: 'End Balance Composition',
            slices: donutSlices,
          },
          trajectory: {
            title: 'Compound Interest Trajectory',
            subtitle: 'Comparing growth balance vs cumulative cash deposits',
            xLabels: chartLabels,
            series: [
              {
                id: 'total-balance',
                name: 'Total Balance',
                color: '#10b981',
                data: chartBalances,
              },
              {
                id: 'contributions',
                name: 'Total Contributions',
                color: '#6366f1',
                data: chartContributions,
              },
            ],
          },
        }}
        annualSchedule={result.breakdown.map((b) => ({
          period: b.year,
          label: `Year ${b.year}`,
          payment: b.deposits,
          principal: b.deposits,
          interest: b.interestEarned,
          totalInterest: b.totalInterest,
          remainingBalance: b.endingBalance,
        }))}
      />
    </div>
  );
};
