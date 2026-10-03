import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, FileDown } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateInflation, InflationInput } from '../../utils/calculations';
import { formatCurrency, getCurrencyConfig } from '../../utils/formatters';
import { SvgLineAreaChart } from '../common/SvgLineAreaChart';
import { ReportModal } from '../common/ReportModal';
import { saveRecentCalculation } from '../../utils/recentCalculations';

interface InflationCalculatorProps {
  currency: CurrencyCode;
  isReportOpen?: boolean;
  onCloseReport?: () => void;
  onOpenReport?: () => void;
  restoredInput?: InflationInput;
}

const DEFAULT_INFLATION: InflationInput = {
  initialAmount: 100000,
  annualInflationRate: 3.2,
  years: 20,
};

export const InflationCalculator: React.FC<InflationCalculatorProps> = ({
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

  const [input, setInput] = useState<InflationInput>(DEFAULT_INFLATION);
  const currencyConfig = getCurrencyConfig(currency);

  // Restore input if triggered from recent calculations or top benchmark ticker
  useEffect(() => {
    if (restoredInput) {
      setInput((prev) => ({ ...prev, ...restoredInput }));
    }
  }, [restoredInput]);

  const result = useMemo(() => calculateInflation(input), [input]);

  // Persist to recent calculations after user adjusts inputs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveRecentCalculation({
        calculatorId: 'inflation',
        calculatorTitle: 'Inflation Calculator',
        currency,
        primarySummary: `Eq. Cost: ${formatCurrency(result.futureEquivalentCost, currency)}`,
        subSummary: `${formatCurrency(input.initialAmount, currency)} today · ${input.annualInflationRate}%/yr · ${input.years} Yrs`,
        inputs: input,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, result.futureEquivalentCost, currency]);

  const chartLabels = result.yearlyHistory.map((h) => `Yr ${h.year}`);
  const futureCosts = result.yearlyHistory.map((h) => h.futureCost);
  const purchasingPowers = result.yearlyHistory.map((h) => h.purchasingPower);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Inflation & Purchasing Power Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate how inflation erodes cash purchasing power and projects equivalent future living costs.
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
            onClick={() => setInput(DEFAULT_INFLATION)}
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
            Inflation Parameters
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Starting Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.initialAmount || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, initialAmount: Math.max(0, parseFloat(e.target.value) || 0) }))
                }
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Annual Inflation (%)</label>
                <button
                  type="button"
                  onClick={() => setInput((p) => ({ ...p, annualInflationRate: 2.9 }))}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                  title="Apply US Bureau of Labor Statistics (BLS) CPI-U Headline Inflation (2.9%)"
                >
                  CPI: 2.9%
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={input.annualInflationRate || ''}
                  onChange={(e) =>
                    setInput((p) => ({
                      ...p,
                      annualInflationRate: Math.max(0, parseFloat(e.target.value) || 0),
                    }))
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
                max="60"
                value={input.years || ''}
                onChange={(e) =>
                  setInput((p) => ({ ...p, years: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Future Equivalent Cost
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
                  {formatCurrency(result.futureEquivalentCost, currency)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  What costs {formatCurrency(input.initialAmount, currency)} today will require this amount in {input.years} years.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Future Purchasing Power</span>
                  <span className="text-lg font-bold text-rose-600 font-mono tabular-nums">
                    {formatCurrency(result.futurePurchasingPower, currency)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Real value of today's {formatCurrency(input.initialAmount, currency)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Cumulative Price Increase</span>
                  <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                    +{result.cumulativeInflationPercent.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Total compounded inflation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Purchasing Power Erosion vs. Future Cost
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracking the nominal cost of living vs the purchasing power of uninvested cash.
        </p>
        <SvgLineAreaChart
          xLabels={chartLabels}
          series={[
            {
              id: 'future-cost',
              name: 'Equivalent Cost',
              color: '#f59e0b',
              data: futureCosts,
            },
            {
              id: 'power',
              name: 'Purchasing Power',
              color: '#f43f5e',
              data: purchasingPowers,
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
        calculatorTitle="Inflation & Purchasing Power Analysis"
        currency={currency}
        metrics={[
          {
            label: `Equivalent Cost (${input.years} Yrs)`,
            value: formatCurrency(result.futureEquivalentCost, currency),
            isPrimary: true,
          },
          {
            label: 'Starting Value',
            value: formatCurrency(input.initialAmount, currency),
          },
          {
            label: 'Future Real Purchasing Power',
            value: formatCurrency(result.futurePurchasingPower, currency),
          },
          {
            label: 'Cumulative Inflation',
            value: `+${result.cumulativeInflationPercent.toFixed(1)}%`,
            subtext: `At ${input.annualInflationRate}% per year`,
          },
        ]}
        parameters={[
          { label: 'Initial Amount (Today)', value: formatCurrency(input.initialAmount, currency) },
          { label: 'Annual Inflation Rate', value: `${input.annualInflationRate}%` },
          { label: 'Time Horizon', value: `${input.years} Years` },
          { label: 'Total Price Multiplier', value: `${(result.futureEquivalentCost / Math.max(1, input.initialAmount)).toFixed(2)}x` },
        ]}
        charts={{
          trajectory: {
            title: 'Purchasing Power Erosion vs Living Cost',
            subtitle: 'Comparing equivalent nominal requirement against uninvested cash decay',
            xLabels: chartLabels,
            series: [
              {
                id: 'future-cost',
                name: 'Equivalent Cost',
                color: '#f59e0b',
                data: futureCosts,
              },
              {
                id: 'power',
                name: 'Purchasing Power',
                color: '#f43f5e',
                data: purchasingPowers,
              },
            ],
          },
        }}
        annualSchedule={result.yearlyHistory.map((h) => ({
          period: h.year,
          label: `Year ${h.year}`,
          payment: h.futureCost,
          principal: h.futureCost,
          interest: h.purchasingPower,
          totalInterest: h.futureCost - input.initialAmount,
          remainingBalance: h.purchasingPower,
        }))}
      />
    </div>
  );
};
