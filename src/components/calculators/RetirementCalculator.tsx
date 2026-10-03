import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, FileDown, Download } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateRetirement, RetirementInput } from '../../utils/calculations';
import { formatCurrency, getCurrencyConfig, exportToCSV } from '../../utils/formatters';
import { SvgDonutChart } from '../common/SvgDonutChart';
import { SvgLineAreaChart } from '../common/SvgLineAreaChart';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface RetirementCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: RetirementInput;
}

const DEFAULT_RETIREMENT: RetirementInput = {
  currentAge: 30,
  retirementAge: 65,
  currentSalary: 75000,
  salaryGrowthPercent: 3.0,
  currentSavings: 35000,
  contributionPercent: 8,
  employerMatchPercent: 50, // 50% match
  employerMatchCapPercent: 6, // up to 6% of salary
  expectedAnnualReturn: 7.5,
  postRetirementYears: 30,
};

export const RetirementCalculator: React.FC<RetirementCalculatorProps> = ({
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

  const [input, setInput] = useState<RetirementInput>(DEFAULT_RETIREMENT);
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations
  useEffect(() => {
    if (restoredInput) {
      setInput(restoredInput);
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateRetirement(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'retirement',
        calculatorTitle: '401(k) Retirement',
        currency,
        primarySummary: `${formatCurrency(result.totalSavingsAtRetirement, currency)} at age ${input.retirementAge}`,
        subSummary: `Age ${input.currentAge} to ${input.retirementAge} · ${formatCurrency(input.currentSalary, currency)} salary · ${input.contributionPercent}% contrib`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.totalSavingsAtRetirement, currency]);

  const donutSlices = [
    {
      label: 'Your Contributions',
      value: result.totalEmployeeContributions,
      color: '#4f46e5',
    },
    {
      label: 'Employer Match',
      value: result.totalEmployerContributions,
      color: '#0ea5e9',
    },
    {
      label: 'Investment Growth',
      value: result.totalGrowth,
      color: '#10b981',
    },
    {
      label: 'Starting Balance',
      value: input.currentSavings,
      color: '#8b5cf6',
    },
  ];

  const chartLabels = result.milestones.map((m) => `Age ${m.age}`);
  const chartBalances = result.milestones.map((m) => m.totalSavings);

  const handleExportCSV = () => {
    const headers = [
      'Age Milestone',
      `Annual Salary (${currency})`,
      `Annual Total Contribution (${currency})`,
      `Investment Gain (${currency})`,
      `Projected Nest Egg (${currency})`,
    ];
    const rows = result.milestones.map((m) => [
      `Age ${m.age}`,
      m.salary.toFixed(2),
      m.annualContribution.toFixed(2),
      m.investmentGain.toFixed(2),
      m.totalSavings.toFixed(2),
    ]);
    exportToCSV(`fincalc-retirement-projection-${input.currentAge}-to-${input.retirementAge}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            401(k) & Retirement Savings Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Project your total nest egg, company match leverage, and estimated monthly retirement income.
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
            title="Export retirement accumulation timeline as CSV spreadsheet for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <span className="text-xs text-slate-500 font-medium ml-1">Presets:</span>
          <button
            onClick={() =>
              setInput({
                currentAge: 25,
                retirementAge: 65,
                currentSalary: 60000,
                salaryGrowthPercent: 3,
                currentSavings: 10000,
                contributionPercent: 10,
                employerMatchPercent: 50,
                employerMatchCapPercent: 6,
                expectedAnnualReturn: 8,
                postRetirementYears: 30,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            Age 25 Early Start
          </button>
          <button
            onClick={() =>
              setInput({
                currentAge: 45,
                retirementAge: 67,
                currentSalary: 110000,
                salaryGrowthPercent: 2.5,
                currentSavings: 200000,
                contributionPercent: 15,
                employerMatchPercent: 50,
                employerMatchCapPercent: 6,
                expectedAnnualReturn: 7,
                postRetirementYears: 25,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            Age 45 Catch-Up
          </button>
          <button
            onClick={() => setInput(DEFAULT_RETIREMENT)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Personal & Career Data
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current Age</label>
              <input
                type="number"
                min="18"
                max="90"
                value={input.currentAge || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, currentAge: parseInt(e.target.value, 10) || 18 }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Retirement Age</label>
              <input
                type="number"
                min="50"
                max="100"
                value={input.retirementAge || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, retirementAge: parseInt(e.target.value, 10) || 65 }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Annual Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.currentSalary || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, currentSalary: Math.max(0, parseFloat(e.target.value) || 0) }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Retirement Savings
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.currentSavings || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, currentSavings: Math.max(0, parseFloat(e.target.value) || 0) }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pt-2 pb-2">
            Contributions & Growth
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Your Contribution</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={input.contributionPercent || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, contributionPercent: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Employer Match %</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={input.employerMatchPercent || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, employerMatchPercent: Math.max(0, parseFloat(e.target.value) || 0) }))
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Match Cap (% Sal)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={input.employerMatchCapPercent || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, employerMatchCapPercent: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expected Return (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.1"
                  value={input.expectedAnnualReturn || ''}
                  onChange={(e) =>
                    setInput((p) => ({ ...p, expectedAnnualReturn: Math.max(0, parseFloat(e.target.value) || 0) }))
                  }
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
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
                  Total Nest Egg at Age {input.retirementAge}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono tabular-nums mt-1">
                  {formatCurrency(result.totalSavingsAtRetirement, currency)}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Monthly Safe Withdrawal (4% Rule):</span>
                <p className="text-lg font-semibold text-indigo-600 font-mono tabular-nums">
                  {formatCurrency(result.projectedMonthlyIncome4Percent, currency)}
                  <span className="text-xs text-slate-500 font-normal"> / mo</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500 block">Total You Contributed</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.totalEmployeeContributions, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Employer Match (Free Money)</span>
                <span className="text-sm font-semibold text-sky-600 font-mono tabular-nums">
                  {formatCurrency(result.totalEmployerContributions, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Compound Market Gains</span>
                <span className="text-sm font-semibold text-emerald-600 font-mono tabular-nums">
                  {formatCurrency(result.totalGrowth, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Retirement Nest Egg Composition
            </h3>
            <SvgDonutChart slices={donutSlices} currency={currency} title="Nest Egg" />
          </div>
        </div>
      </div>

      {/* Trajectory */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Retirement Savings Accumulation Timeline
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracking the growth of your nest egg from current age ({input.currentAge}) to retirement ({input.retirementAge}).
        </p>
        <SvgLineAreaChart
          xLabels={chartLabels}
          series={[
            {
              id: 'retirement-savings',
              name: 'Projected Balance',
              color: '#10b981',
              data: chartBalances,
            },
          ]}
          currency={currency}
          height={260}
        />
      </div>

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="401(k) & Retirement Savings Analysis"
        currency={currency}
        metrics={[
          {
            label: `Nest Egg at Age ${input.retirementAge}`,
            value: formatCurrency(result.totalSavingsAtRetirement, currency),
            isPrimary: true,
          },
          {
            label: 'Monthly Income (4% Rule)',
            value: `${formatCurrency(result.projectedMonthlyIncome4Percent, currency)} / mo`,
          },
          {
            label: 'Your Total Contributions',
            value: formatCurrency(result.totalEmployeeContributions, currency),
          },
          {
            label: 'Employer Match + Gains',
            value: formatCurrency(result.totalEmployerContributions + result.totalGrowth, currency),
            subtext: `Starting age ${input.currentAge} to ${input.retirementAge}`,
          },
        ]}
        parameters={[
          { label: 'Current Age', value: `${input.currentAge} Years` },
          { label: 'Planned Retirement Age', value: `${input.retirementAge} Years` },
          { label: 'Current Annual Salary', value: formatCurrency(input.currentSalary, currency) },
          { label: 'Annual Salary Growth', value: `${input.salaryGrowthPercent}%` },
          { label: 'Current Retirement Savings', value: formatCurrency(input.currentSavings, currency) },
          { label: 'Your Contribution Rate', value: `${input.contributionPercent}% of salary` },
          {
            label: 'Employer Match',
            value: `${input.employerMatchPercent}% match up to ${input.employerMatchCapPercent}% salary`,
          },
          { label: 'Expected Annual Return', value: `${input.expectedAnnualReturn}%` },
        ]}
        charts={{
          donut: {
            title: 'Retirement Wealth Sources',
            slices: donutSlices,
          },
          trajectory: {
            title: 'Wealth Accumulation Timeline',
            subtitle: `Projected portfolio balance from age ${input.currentAge} to ${input.retirementAge}`,
            xLabels: chartLabels,
            series: [
              {
                id: 'retirement-savings',
                name: 'Projected Balance',
                color: '#10b981',
                data: chartBalances,
              },
            ],
          },
        }}
        annualSchedule={result.milestones.map((m) => ({
          period: m.age,
          label: `Age ${m.age}`,
          payment: m.annualContribution,
          principal: m.annualContribution,
          interest: m.investmentGain,
          totalInterest: m.investmentGain,
          remainingBalance: m.totalSavings,
        }))}
      />
    </div>
  );
};
