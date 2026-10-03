import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, Sparkles, FileDown, Download } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateMortgage } from '../../utils/calculations';
import { formatCurrency, getCurrencyConfig, exportToCSV } from '../../utils/formatters';
import { SvgLineAreaChart } from '../common/SvgLineAreaChart';
import { AmortizationTable } from '../common/AmortizationTable';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface AmortizationCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: { loanAmount?: number; termYears?: number; interestRate?: number; extraMonthly?: number };
}

export const AmortizationCalculator: React.FC<AmortizationCalculatorProps> = ({
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

  const currencyConfig = getCurrencyConfig(currency);

  const [loanAmount, setLoanAmount] = useState(300000);
  const [termYears, setTermYears] = useState(30);
  const [interestRate, setInterestRate] = useState(6.5);
  const [extraMonthly, setExtraMonthly] = useState(250);

  // Restore input if triggered from recent calculations
  useEffect(() => {
    if (restoredInput) {
      if (restoredInput.loanAmount !== undefined) setLoanAmount(restoredInput.loanAmount);
      if (restoredInput.termYears !== undefined) setTermYears(restoredInput.termYears);
      if (restoredInput.interestRate !== undefined) setInterestRate(restoredInput.interestRate);
      if (restoredInput.extraMonthly !== undefined) setExtraMonthly(restoredInput.extraMonthly);
    }
  }, [restoredInput]);

  // Baseline without extra
  const baseline = useMemo(
    () =>
      calculateMortgage({
        homePrice: loanAmount,
        downPaymentPercent: 0,
        loanTermYears: termYears,
        interestRate,
        propertyTaxAnnual: 0,
        homeInsuranceAnnual: 0,
        pmiPercent: 0,
        hoaMonthly: 0,
        extraMonthlyPayment: 0,
      }),
    [loanAmount, termYears, interestRate]
  );

  // With extra payment
  const accelerated = useMemo(
    () =>
      calculateMortgage({
        homePrice: loanAmount,
        downPaymentPercent: 0,
        loanTermYears: termYears,
        interestRate,
        propertyTaxAnnual: 0,
        homeInsuranceAnnual: 0,
        pmiPercent: 0,
        hoaMonthly: 0,
        extraMonthlyPayment: extraMonthly,
      }),
    [loanAmount, termYears, interestRate, extraMonthly]
  );

  const interestSaved = Math.max(0, baseline.totalInterestPaid - accelerated.totalInterestPaid);
  const monthsSaved = accelerated.monthsSavedWithExtra;
  const yearsSaved = (monthsSaved / 12).toFixed(1);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'amortization',
        calculatorTitle: 'Extra Payments & Amortization',
        currency,
        primarySummary: `Saves ${formatCurrency(interestSaved, currency)}`,
        subSummary: `${formatCurrency(loanAmount, currency)} loan · +${formatCurrency(extraMonthly, currency)}/mo · ${yearsSaved} yrs saved`,
        inputs: { loanAmount, termYears, interestRate, extraMonthly },
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [loanAmount, termYears, interestRate, extraMonthly, interestSaved, yearsSaved, currency]);

  // Chart comparison
  const maxPeriods = Math.max(baseline.annualSchedule.length, accelerated.annualSchedule.length);
  const chartLabels = Array.from({ length: maxPeriods }, (_, i) => `Yr ${i + 1}`);

  const baselineBalances = chartLabels.map((_, i) =>
    i < baseline.annualSchedule.length ? baseline.annualSchedule[i].remainingBalance : 0
  );

  const acceleratedBalances = chartLabels.map((_, i) =>
    i < accelerated.annualSchedule.length ? accelerated.annualSchedule[i].remainingBalance : 0
  );

  const handleExportCSV = () => {
    const headers = [
      'Period',
      `Base Payment (${currency})`,
      `Extra Principal (${currency})`,
      `Total Payment (${currency})`,
      `Principal Paid (${currency})`,
      `Interest Paid (${currency})`,
      `Total Interest (${currency})`,
      `Remaining Balance (${currency})`,
    ];
    const rows = accelerated.annualSchedule.map((d) => [
      d.label,
      (d.payment - (d.extraPayment || 0)).toFixed(2),
      (d.extraPayment || 0).toFixed(2),
      d.payment.toFixed(2),
      d.principal.toFixed(2),
      d.interest.toFixed(2),
      d.totalInterest.toFixed(2),
      d.remainingBalance.toFixed(2),
    ]);
    exportToCSV(`fincalc-extra-payments-schedule-${termYears}yrs`, [headers, ...rows]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Amortization & Extra Payments Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate how extra principal payments accelerate debt freedom and eliminate interest.
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
            title="Export accelerated payoff amortization schedule as CSV spreadsheet for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setLoanAmount(300000);
              setTermYears(30);
              setInterestRate(6.5);
              setExtraMonthly(250);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors ml-1"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inputs & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Loan Parameters
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Loan / Principal Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="5000"
                value={loanAmount || ''}
                onChange={(e) => setLoanAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Original Term (Years)</label>
              <select
                value={termYears}
                onChange={(e) => setTermYears(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={30}>30 Years</option>
                <option value={25}>25 Years</option>
                <option value={20}>20 Years</option>
                <option value={15}>15 Years</option>
                <option value={10}>10 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Interest Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.05"
                  value={interestRate || ''}
                  onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  %
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-indigo-900 border-b border-indigo-100 pt-2 pb-2">
            Extra Payment Acceleration
          </h2>

          <div>
            <label className="block text-xs font-medium text-indigo-800 mb-1">
              Extra Principal Paid Every Month
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={extraMonthly || ''}
                onChange={(e) => setExtraMonthly(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 text-sm bg-indigo-50/50 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums text-indigo-900 font-semibold"
                placeholder="200"
              />
            </div>
          </div>

          {/* Quick extra buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Quick set:</span>
            {[50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setExtraMonthly(amt)}
                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                +{currencyConfig.symbol.trim()}{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Right Comparison Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big Savings Highlight */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-950">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Accelerated Payoff Benefit</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-emerald-700">
              {formatCurrency(interestSaved, currency)}
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 mt-1">
              Total interest saved over the life of the loan. You will pay off your debt{' '}
              <strong>{yearsSaved} years ({monthsSaved} months) earlier</strong>!
            </p>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-600">
                <tr>
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4 text-right">Standard Schedule</th>
                  <th className="py-3 px-4 text-right text-indigo-600 font-semibold">
                    With Extra Payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">Monthly Payment</td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatCurrency(baseline.monthlyPrincipalAndInterest, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-600 font-bold">
                    {formatCurrency(accelerated.totalMonthlyPayment, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">Total Interest</td>
                  <td className="py-3 px-4 text-right text-rose-600">
                    {formatCurrency(baseline.totalInterestPaid, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                    {formatCurrency(accelerated.totalInterestPaid, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">Total Loan Cost</td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {formatCurrency(baseline.totalCostOfLoan, currency)}
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-600 font-semibold">
                    {formatCurrency(accelerated.totalCostOfLoan, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">Total Payoff Time</td>
                  <td className="py-3 px-4 text-right text-slate-700">{termYears} Years</td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                    {accelerated.payoffYears} Years
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trajectory comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Payoff Speed Comparison: Standard vs. Extra Payment
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Notice how the green curve reaches zero balance significantly ahead of the standard curve.
        </p>
        <SvgLineAreaChart
          xLabels={chartLabels}
          series={[
            {
              id: 'baseline',
              name: 'Standard Payoff',
              color: '#94a3b8',
              data: baselineBalances,
            },
            {
              id: 'accelerated',
              name: 'Accelerated Payoff',
              color: '#10b981',
              data: acceleratedBalances,
            },
          ]}
          currency={currency}
          height={260}
        />
      </div>

      {/* Accelerated Amortization Table */}
      <AmortizationTable
        annualSchedule={accelerated.annualSchedule}
        monthlySchedule={accelerated.monthlySchedule}
        currency={currency}
        title="Accelerated Amortization Schedule (With Extra Payments)"
      />

      {/* PDF Export Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={handleCloseReport}
        calculatorTitle="Debt Amortization & Accelerated Payoff Analysis"
        currency={currency}
        metrics={[
          {
            label: 'Total Interest Saved',
            value: formatCurrency(interestSaved, currency),
            isPrimary: true,
          },
          {
            label: 'Time Saved Off Loan',
            value: `${yearsSaved} Years (${monthsSaved} Mos)`,
          },
          {
            label: 'Accelerated Monthly P&I',
            value: formatCurrency(accelerated.totalMonthlyPayment, currency),
          },
          {
            label: 'Accelerated Total Cost',
            value: formatCurrency(accelerated.totalCostOfLoan, currency),
            subtext: `Payoff in ${accelerated.payoffYears} yrs instead of ${termYears} yrs`,
          },
        ]}
        parameters={[
          { label: 'Current Principal Loan Balance', value: formatCurrency(loanAmount, currency) },
          { label: 'Standard Loan Term', value: `${termYears} Years` },
          { label: 'Interest Rate', value: `${interestRate}%` },
          { label: 'Standard Monthly Payment', value: formatCurrency(baseline.monthlyPrincipalAndInterest, currency) },
          { label: 'Extra Principal Paid / Mo', value: formatCurrency(extraMonthly, currency) },
          { label: 'Accelerated Total Monthly Payment', value: formatCurrency(accelerated.totalMonthlyPayment, currency) },
        ]}
        charts={{
          trajectory: {
            title: 'Debt Payoff Comparison',
            subtitle: 'Standard 30-Yr schedule vs Accelerated payoff with extra payments',
            xLabels: chartLabels,
            series: [
              {
                id: 'baseline',
                name: 'Standard Payoff',
                color: '#94a3b8',
                data: baselineBalances,
              },
              {
                id: 'accelerated',
                name: 'Accelerated Payoff',
                color: '#10b981',
                data: acceleratedBalances,
              },
            ],
          },
        }}
        annualSchedule={accelerated.annualSchedule}
        summaryNote={`By contributing an extra ${formatCurrency(extraMonthly, currency)} each month toward principal, your loan is paid off in ${accelerated.payoffYears} years, saving ${formatCurrency(interestSaved, currency)} in total interest payments.`}
      />
    </div>
  );
};
