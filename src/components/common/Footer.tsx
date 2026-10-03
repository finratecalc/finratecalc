import React from 'react';
import { CalculatorId } from '../../types/financial';
import { CalculatorFaq } from './CalculatorFaq';

interface FooterProps {
  onSelectCalculator: (id: CalculatorId | 'directory') => void;
  activeCalculator?: CalculatorId | 'directory';
}

export const Footer: React.FC<FooterProps> = ({ onSelectCalculator, activeCalculator = 'mortgage' }) => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 print:hidden">
      {/* Frequently Asked Questions & Financial Tips Section */}
      <CalculatorFaq
        activeCalculator={activeCalculator}
        onSelectCalculator={onSelectCalculator}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                FinRate<span className="text-emerald-600">Calc</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">.com</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fast, transparent, and accurate financial calculations modeled after standard US actuarial formulas. Designed to empower informed US lending, investing, tax, and retirement decisions.
            </p>
          </div>

          {/* Quick links 1 */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Lending & Real Estate
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onSelectCalculator('mortgage')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Mortgage Calculator (30 & 15-Yr)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCalculator('loan')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Personal & Term Loan Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCalculator('auto-loan')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Auto Loan & Trade-in Tax
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCalculator('amortization')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Extra Principal & Early Payoff
                </button>
              </li>
            </ul>
          </div>

          {/* Quick links 2 */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Growth & Life Planning
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onSelectCalculator('investment')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Compound Interest & S&P 500
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCalculator('retirement')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  401(k) & Retirement Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCalculator('inflation')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  US Inflation & CPI-U Power
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCalculator('salary')}
                  className="hover:text-emerald-700 transition-colors"
                >
                  Salary & W-4 Take-Home Pay
                </button>
              </li>
            </ul>
          </div>

          {/* Formula disclosure */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono">
              Accuracy & Standards
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Algorithms utilize standard CFPB amortized monthly compounding and IRS tax calculation schedules with 100% client-side privacy.
            </p>
            <button
              onClick={() => onSelectCalculator('directory')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Browse all 8 US financial calculators &rarr;
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinRateCalc.com. All financial tools are provided for educational and informational purposes.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Standard US Amortization</span>
            <span aria-hidden="true">·</span>
            <span>Bank-Grade Formulas</span>
            <span aria-hidden="true">·</span>
            <span>Client-Side Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
