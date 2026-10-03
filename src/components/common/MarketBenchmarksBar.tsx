import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, Check, Sparkles, ArrowRight } from 'lucide-react';
import { CalculatorId, CurrencyCode } from '../../types/financial';
import {
  MarketBenchmark,
  getRegionalMarketData,
  fetchLiveMarketRates,
  getLastUpdatedTimestamp,
} from '../../services/marketRatesService';

interface MarketBenchmarksBarProps {
  currency?: CurrencyCode;
  onSelectCalculator?: (id: CalculatorId) => void;
  onApplyBenchmark?: (benchmark: MarketBenchmark) => void;
}

export const MarketBenchmarksBar: React.FC<MarketBenchmarksBarProps> = ({
  currency = 'USD',
  onSelectCalculator,
  onApplyBenchmark,
}) => {
  const regionalData = getRegionalMarketData(currency);
  const [benchmarks, setBenchmarks] = useState<MarketBenchmark[]>(regionalData.benchmarks);
  const [lastUpdated, setLastUpdated] = useState<string>(getLastUpdatedTimestamp());
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  useEffect(() => {
    // When currency changes, load that region's data
    const currentData = getRegionalMarketData(currency);
    setBenchmarks(currentData.benchmarks);

    fetchLiveMarketRates(currency).then((res) => {
      if (res && res.benchmarks) {
        setBenchmarks(res.benchmarks);
        setLastUpdated(res.lastUpdated);
      }
    });
  }, [currency]);

  const handleClickBenchmark = (b: MarketBenchmark) => {
    setAppliedId(b.id);
    setTimeout(() => setAppliedId(null), 2500);

    if (onApplyBenchmark) {
      onApplyBenchmark(b);
    } else if (onSelectCalculator) {
      onSelectCalculator(b.target);
    }
  };

  return (
    <>
      <div className="bg-slate-950 text-slate-300 text-[11px] font-mono border-b border-slate-800 print:hidden select-none relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Left: Dynamic Regional Benchmarks Ticker */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div
              onClick={() => setShowSourcesModal(true)}
              className="flex items-center gap-1.5 font-sans font-semibold text-emerald-300 bg-emerald-950/90 hover:bg-emerald-900/90 border border-emerald-700/60 px-2 py-0.5 rounded cursor-pointer transition-colors shadow-2xs"
              title={`Click to view official ${regionalData.regionName} sources & benchmarks`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] tracking-wide uppercase font-bold">
                {regionalData.shortTag}
              </span>
              <Info className="w-2.5 h-2.5 text-emerald-400 opacity-70" />
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              {benchmarks.map((b, idx) => {
                const isJustApplied = appliedId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleClickBenchmark(b)}
                    className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all cursor-pointer group ${
                      isJustApplied
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'hover:bg-slate-800/80 hover:text-white'
                    }`}
                    title={`Click to open ${b.target} calculator and apply ${b.val} (${regionalData.regionName})`}
                  >
                    <span className="text-slate-400 group-hover:text-slate-200">
                      {b.shortLabel}:
                    </span>
                    <span className="font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:underline flex items-center gap-0.5">
                      {b.val}
                      {isJustApplied ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400 animate-in zoom-in-50" />
                      ) : (
                        <Sparkles className="w-2.5 h-2.5 text-emerald-500/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </span>
                    {idx < benchmarks.length - 1 && (
                      <span className="text-slate-800 ml-2 select-none pointer-events-none">|</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Sources trigger & Trust badge */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 text-slate-400">
            <button
              onClick={() => setShowSourcesModal(true)}
              className="flex items-center gap-1 font-sans text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{regionalData.sourceSummary}</span>
            </button>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400 font-sans text-[10px]">
              {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Official Regional Sources Modal */}
      {showSourcesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  {regionalData.regionName} Official Data
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {regionalData.regionName} Market Rates & Standards
                </h3>
              </div>
              <button
                onClick={() => setShowSourcesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When you select <span className="font-semibold text-slate-900">{currency}</span>, FinRateCalc automatically pulls real-world regulatory benchmarks from {regionalData.sourceSummary}. Clicking any rate applies it immediately into your active calculation.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {benchmarks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    handleClickBenchmark(b);
                    setShowSourcesModal(false);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{b.label}</span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {b.val}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{b.description}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      Source: {b.source} ({b.frequency})
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0 ml-3">
                    <span>Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Multi-Currency Adaptive · Client-side privacy</span>
              <button
                onClick={() => setShowSourcesModal(false)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-sans font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
