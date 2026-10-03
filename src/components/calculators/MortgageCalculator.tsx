import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, Sparkles, FileDown, Download } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateMortgage, MortgageInput } from '../../utils/calculations';
import { formatCurrency, formatPercent, getCurrencyConfig, exportToCSV } from '../../utils/formatters';
import { SvgDonutChart } from '../common/SvgDonutChart';
import { SvgLineAreaChart } from '../common/SvgLineAreaChart';
import { AmortizationTable } from '../common/AmortizationTable';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface MortgageCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: MortgageInput;
}

const DEFAULT_INPUT: MortgageInput = {
  homePrice: 400000,
  downPaymentPercent: 20,
  loanTermYears: 30,
  interestRate: 6.5,
  propertyTaxAnnual: 4800,
  homeInsuranceAnnual: 1400,
  pmiPercent: 0.5,
  hoaMonthly: 0,
  extraMonthlyPayment: 0,
};

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
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

  const [input, setInput] = useState<MortgageInput>(DEFAULT_INPUT);
  const [downPaymentMode, setDownPaymentMode] = useState<'percent' | 'amount'>('percent');
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations or top benchmark ticker
  useEffect(() => {
    if (restoredInput) {
      setInput((prev) => ({ ...prev, ...restoredInput }));
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateMortgage(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'mortgage',
        calculatorTitle: 'Mortgage Calculator',
        currency,
        primarySummary: `${formatCurrency(result.totalMonthlyPayment, currency)} / mo`,
        subSummary: `${formatCurrency(input.homePrice, currency)} · ${input.loanTermYears} Yrs · ${input.interestRate}%`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.totalMonthlyPayment, currency]);

  const handlePriceChange = (price: number) => {
    setInput((prev) => ({ ...prev, homePrice: Math.max(0, price) }));
  };

  const handleDownPercentChange = (pct: number) => {
    setInput((prev) => ({ ...prev, downPaymentPercent: Math.min(100, Math.max(0, pct)) }));
  };

  const handleDownAmountChange = (amt: number) => {
    if (input.homePrice <= 0) return;
    const pct = (amt / input.homePrice) * 100;
    setInput((prev) => ({ ...prev, downPaymentPercent: Math.min(100, Math.max(0, pct)) }));
  };

  const downPaymentAmount = (input.homePrice * input.downPaymentPercent) / 100;

  // Donut slices
  const donutSlices = [
    {
      label: 'Principal & Interest',
      value: result.monthlyPrincipalAndInterest,
      color: '#4f46e5', // indigo
    },
    {
      label: 'Property Tax',
      value: result.monthlyPropertyTax,
      color: '#0ea5e9', // sky
    },
    {
      label: 'Homeowners Insurance',
      value: result.monthlyHomeInsurance,
      color: '#10b981', // emerald
    },
    ...(result.monthlyPmi > 0
      ? [{ label: 'PMI Insurance', value: result.monthlyPmi, color: '#f59e0b' }]
      : []),
    ...(result.monthlyHoa > 0
      ? [{ label: 'HOA Fees', value: result.monthlyHoa, color: '#ec4899' }]
      : []),
    ...(input.extraMonthlyPayment > 0
      ? [{ label: 'Extra Principal', value: input.extraMonthlyPayment, color: '#8b5cf6' }]
      : []),
  ];

  // Payoff Chart data
  const chartLabels = result.annualSchedule.map((s) => s.label);
  const chartBalances = result.annualSchedule.map((s) => s.remainingBalance);

  const handleExportAmortizationCSV = () => {
    const hasExtraPayment = result.annualSchedule.some((d) => (d.extraPayment || 0) > 0);
    const headers = [
      'Period',
      `Payment (${currency})`,
      `Principal (${currency})`,
      `Interest (${currency})`,
      ...(hasExtraPayment ? [`Extra Principal (${currency})`] : []),
      `Total Interest Paid (${currency})`,
      `Remaining Balance (${currency})`,
    ];
    const rows = result.annualSchedule.map((d) => [
      d.label,
      d.payment.toFixed(2),
      d.principal.toFixed(2),
      d.interest.toFixed(2),
      ...(hasExtraPayment ? [(d.extraPayment || 0).toFixed(2)] : []),
      d.totalInterest.toFixed(2),
      d.remainingBalance.toFixed(2),
    ]);
    exportToCSV(`fincalc-mortgage-amortization-${input.loanTermYears}yrs`, [headers, ...rows]);
  };

  return (
    <div className="space-y-8">
      {/* Intro Header & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Mortgage Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Estimate monthly payments with taxes, insurance, PMI, and extra payoff acceleration.
          </p>
        </div>

        {/* Quick Presets & PDF Download */}
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
            onClick={handleExportAmortizationCSV}
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
                ...DEFAULT_INPUT,
                homePrice: 400000,
                loanTermYears: 30,
                interestRate: 6.5,
                downPaymentPercent: 20,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            30-Yr Fixed (400k)
          </button>
          <button
            onClick={() =>
              setInput({
                ...DEFAULT_INPUT,
                homePrice: 320000,
                loanTermYears: 15,
                interestRate: 5.75,
                downPaymentPercent: 20,
              })
            }
            className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
          >
            15-Yr Fixed (320k)
          </button>
          <button
            onClick={() => setInput(DEFAULT_INPUT)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs Left, Output Cards & Donut Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Loan Parameters
          </h2>

          {/* Home Price */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Home Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="5000"
                value={input.homePrice || ''}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">Down Payment</label>
              <div className="flex items-center text-[11px] font-medium bg-slate-100 rounded p-0.5">
                <button
                  type="button"
                  onClick={() => setDownPaymentMode('percent')}
                  className={`px-1.5 py-0.5 rounded ${
                    downPaymentMode === 'percent' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDownPaymentMode('amount')}
                  className={`px-1.5 py-0.5 rounded ${
                    downPaymentMode === 'amount' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {currencyConfig.symbol.trim()}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={input.downPaymentPercent || ''}
                  onChange={(e) => handleDownPercentChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={Math.round(downPaymentAmount) || ''}
                  onChange={(e) => handleDownAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>
            {input.downPaymentPercent < 20 && (
              <p className="text-[11px] text-amber-600 mt-1">
                Down payment under 20% typically requires Private Mortgage Insurance (PMI).
              </p>
            )}
          </div>

          {/* Loan Term & Interest Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Loan Term</label>
              <select
                value={input.loanTermYears}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, loanTermYears: parseInt(e.target.value, 10) }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={30}>30 Years (360 mos)</option>
                <option value={20}>20 Years (240 mos)</option>
                <option value={15}>15 Years (180 mos)</option>
                <option value={10}>10 Years (120 mos)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Interest Rate</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, interestRate: 6.62, loanTermYears: 30 }))}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                    title="Apply Freddie Mac 30-Yr US Benchmark (6.62%)"
                  >
                    30Y: 6.62%
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, interestRate: 5.89, loanTermYears: 15 }))}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Apply Freddie Mac 15-Yr US Benchmark (5.89%)"
                  >
                    15Y: 5.89%
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.05"
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

          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pt-3 pb-2">
            Taxes, Insurance & Escrow
          </h2>

          {/* Property Tax & Homeowners Insurance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Annual Tax</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={input.propertyTaxAnnual || ''}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      propertyTaxAnnual: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Annual Insurance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={input.homeInsuranceAnnual || ''}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      homeInsuranceAnnual: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* HOA & Extra Monthly Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Monthly HOA</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={input.hoaMonthly || ''}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      hoaMonthly: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-indigo-700 mb-1">Extra Principal/Mo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 text-xs font-mono">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={input.extraMonthlyPayment || ''}
                  onChange={(e) =>
                    setInput((prev) => ({
                      ...prev,
                      extraMonthlyPayment: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-indigo-50/50 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums text-indigo-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Payment Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Monthly Payment
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                  {formatCurrency(result.totalMonthlyPayment, currency)}
                  <span className="text-sm font-normal text-slate-500"> / mo</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-500">Loan Amount:</span>
                <p className="text-base font-semibold text-slate-800 font-mono tabular-nums">
                  {formatCurrency(result.loanAmount, currency)}
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Interest</span>
                <span className="text-sm font-semibold text-rose-600 font-mono tabular-nums">
                  {formatCurrency(result.totalInterestPaid, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Total Loan Cost</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(result.totalCostOfLoan, currency)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Payoff Term</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {result.payoffYears} Years
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Down Payment</span>
                <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                  {formatPercent(input.downPaymentPercent, 1)}
                </span>
              </div>
            </div>

            {/* Extra payment callout if applied */}
            {input.extraMonthlyPayment > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Paying extra saves{' '}
                    <strong className="font-semibold font-mono tabular-nums">
                      {formatCurrency(result.interestSavedWithExtra, currency)}
                    </strong>{' '}
                    in interest!
                  </span>
                </div>
                <span className="font-medium font-mono tabular-nums">
                  {Math.floor(result.monthsSavedWithExtra / 12)}y {result.monthsSavedWithExtra % 12}m earlier
                </span>
              </div>
            )}
          </div>

          {/* Breakdown Donut Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Monthly Payment Breakdown
            </h3>
            <SvgDonutChart slices={donutSlices} currency={currency} title="Payment" />
          </div>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Loan Balance Payoff Curve
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracking remaining mortgage principal across the amortization period.
        </p>
        <SvgLineAreaChart
          xLabels={chartLabels}
          series={[
            {
              id: 'balance',
              name: 'Remaining Balance',
              color: '#4f46e5',
              data: chartBalances,
            },
          ]}
          currency={currency}
          height={260}
        />
      </div>

      {/* Detailed Amortization Table */}
      <AmortizationTable
        annualSchedule={result.annualSchedule}
        monthlySchedule={result.monthlySchedule}
        currency={currency}
        title="Mortgage Amortization Schedule"
      />

      {/* Educational Article / Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
        <h3 className="text-base font-semibold text-slate-900">Understanding Mortgage Calculations</h3>
        <p>
          A mortgage is a debt instrument used to purchase real estate. Monthly payments are calculated using standard amortization mathematics where early payments predominantly cover interest, while later payments amortize principal.
        </p>
        <p>
          <strong>Escrow Accounts:</strong> Lenders typically collect 1/12th of your annual property taxes and homeowner’s insurance each month to hold in escrow and remit on your behalf when due.
        </p>
        <p>
          <strong>Private Mortgage Insurance (PMI):</strong> Conventional loans with a down payment under 20% generally mandate PMI to safeguard the lender against default. Once your loan balance falls to 78%–80% of original value, you can request PMI cancellation.
        </p>
      </div>

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="Mortgage Loan Analysis"
        currency={currency}
        metrics={[
          {
            label: 'Total Monthly Payment',
            value: `${formatCurrency(result.totalMonthlyPayment, currency)} / mo`,
            isPrimary: true,
          },
          {
            label: 'Principal Loan Amount',
            value: formatCurrency(result.loanAmount, currency),
          },
          {
            label: 'Total Interest Paid',
            value: formatCurrency(result.totalInterestPaid, currency),
          },
          {
            label: 'Total Cost of Loan',
            value: formatCurrency(result.totalCostOfLoan, currency),
            subtext: `${result.payoffYears} Years Duration`,
          },
        ]}
        parameters={[
          { label: 'Home Purchase Price', value: formatCurrency(input.homePrice, currency) },
          {
            label: 'Down Payment',
            value: `${formatCurrency(downPaymentAmount, currency)} (${input.downPaymentPercent}%)`,
          },
          { label: 'Loan Term', value: `${input.loanTermYears} Years (${input.loanTermYears * 12} Mos)` },
          { label: 'Interest Rate', value: `${input.interestRate}%` },
          { label: 'Property Tax (Annual)', value: formatCurrency(input.propertyTaxAnnual, currency) },
          { label: 'Home Insurance (Annual)', value: formatCurrency(input.homeInsuranceAnnual, currency) },
          { label: 'PMI Insurance Rate', value: `${input.pmiPercent}%` },
          { label: 'Monthly HOA Fees', value: formatCurrency(input.hoaMonthly, currency) },
          { label: 'Extra Principal / Mo', value: formatCurrency(input.extraMonthlyPayment, currency) },
        ]}
        charts={{
          donut: {
            title: 'Monthly Payment Allocation',
            slices: donutSlices,
          },
          trajectory: {
            title: 'Loan Principal Payoff Schedule',
            subtitle: 'Remaining balance amortizing towards 0',
            xLabels: chartLabels,
            series: [
              {
                id: 'balance',
                name: 'Remaining Balance',
                color: '#4f46e5',
                data: chartBalances,
              },
            ],
          },
        }}
        annualSchedule={result.annualSchedule}
        summaryNote={
          input.extraMonthlyPayment > 0
            ? `With an extra payment of ${formatCurrency(input.extraMonthlyPayment, currency)}/month, you save ${formatCurrency(result.interestSavedWithExtra, currency)} in interest and pay off the loan ${Math.floor(result.monthsSavedWithExtra / 12)} years earlier.`
            : undefined
        }
      />
    </div>
  );
};
