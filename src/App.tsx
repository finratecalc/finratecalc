import React, { useState } from 'react';
import {
  Home,
  CreditCard,
  TrendingUp,
  Car,
  Clock,
  Layers,
  Percent,
  DollarSign,
  Grid,
  Scale,
  FileDown,
  CheckCircle2,
} from 'lucide-react';
import { CalculatorId, CurrencyCode, CalculationHistoryItem } from './types/financial';
import { MarketBenchmark } from './services/marketRatesService';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MortgageCalculator } from './components/calculators/MortgageCalculator';
import { LoanCalculator } from './components/calculators/LoanCalculator';
import { InvestmentCalculator } from './components/calculators/InvestmentCalculator';
import { AutoLoanCalculator } from './components/calculators/AutoLoanCalculator';
import { RetirementCalculator } from './components/calculators/RetirementCalculator';
import { AmortizationCalculator } from './components/calculators/AmortizationCalculator';
import { InflationCalculator } from './components/calculators/InflationCalculator';
import { SalaryCalculator } from './components/calculators/SalaryCalculator';
import { CalculatorDirectory } from './components/directory/CalculatorDirectory';
import { LoanComparisonModal } from './components/common/LoanComparisonModal';

export default function App() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId | 'directory'>('mortgage');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Storage for restored inputs keyed by calculator ID
  const [restoredInputs, setRestoredInputs] = useState<Partial<Record<CalculatorId, any>>>({});
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  const handleRestoreCalculation = (item: CalculationHistoryItem) => {
    setActiveCalculator(item.calculatorId);
    setCurrency(item.currency);
    setRestoredInputs((prev) => ({
      ...prev,
      [item.calculatorId]: item.inputs,
    }));
    setRestoreNotice(`Restored: ${item.calculatorTitle} (${item.primarySummary})`);
    setTimeout(() => {
      setRestoreNotice(null);
    }, 4000);
  };

  const handleApplyBenchmark = (b: MarketBenchmark) => {
    setActiveCalculator(b.target);
    setRestoredInputs((prev) => ({
      ...prev,
      [b.target]: {
        ...(prev[b.target] || {}),
        ...b.patchInputs,
      },
    }));
    setRestoreNotice(`✓ Applied ${b.label} (${b.val}) to ${b.target.toUpperCase()} calculator`);
    setTimeout(() => {
      setRestoreNotice(null);
    }, 4000);
  };

  const navItems: { id: CalculatorId | 'directory'; label: string; icon: React.ReactNode }[] = [
    { id: 'mortgage', label: 'Mortgage', icon: <Home className="w-4 h-4" /> },
    { id: 'loan', label: 'Personal Loan', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'investment', label: 'Compound Interest', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'auto-loan', label: 'Auto Loan', icon: <Car className="w-4 h-4" /> },
    { id: 'retirement', label: '401(k) Retirement', icon: <Clock className="w-4 h-4" /> },
    { id: 'amortization', label: 'Extra Payments', icon: <Layers className="w-4 h-4" /> },
    { id: 'inflation', label: 'Inflation', icon: <Percent className="w-4 h-4" /> },
    { id: 'salary', label: 'Take-Home Pay', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'directory', label: 'Directory', icon: <Grid className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Primary Top Bar with Recent Calculations */}
      <Header
        activeCalculator={activeCalculator}
        onSelectCalculator={setActiveCalculator}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenReport={() => setIsReportOpen(true)}
        onRestoreCalculation={handleRestoreCalculation}
        onApplyBenchmark={handleApplyBenchmark}
      />

      {/* Floating Restore Toast Notification */}
      {restoreNotice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{restoreNotice}</span>
          <button
            onClick={() => setRestoreNotice(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub Navigation Bar / Fast Tab Switcher */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 print:hidden overflow-x-auto shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveCalculator(item.id);
                  setIsReportOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeCalculator === item.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {activeCalculator !== 'directory' && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                title="Download formatted statement as PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>PDF Report</span>
              </button>
            )}

            {/* Quick Scenario Comparator button */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300/80 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>Compare 2 Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeCalculator === 'mortgage' && (
          <MortgageCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['mortgage']}
          />
        )}
        {activeCalculator === 'loan' && (
          <LoanCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['loan']}
          />
        )}
        {activeCalculator === 'investment' && (
          <InvestmentCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['investment']}
          />
        )}
        {activeCalculator === 'auto-loan' && (
          <AutoLoanCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['auto-loan']}
          />
        )}
        {activeCalculator === 'retirement' && (
          <RetirementCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['retirement']}
          />
        )}
        {activeCalculator === 'amortization' && (
          <AmortizationCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['amortization']}
          />
        )}
        {activeCalculator === 'inflation' && (
          <InflationCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['inflation']}
          />
        )}
        {activeCalculator === 'salary' && (
          <SalaryCalculator
            currency={currency}
            isReportOpen={isReportOpen}
            onOpenReport={() => setIsReportOpen(true)}
            onCloseReport={() => setIsReportOpen(false)}
            restoredInput={restoredInputs['salary']}
          />
        )}
        {activeCalculator === 'directory' && (
          <CalculatorDirectory onSelectCalculator={(id) => setActiveCalculator(id)} />
        )}
      </main>

      {/* Side-by-side comparison modal */}
      <LoanComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currency={currency}
      />

      {/* Footer with contextual FAQ & Financial Tips */}
      <Footer
        onSelectCalculator={setActiveCalculator}
        activeCalculator={activeCalculator}
      />
    </div>
  );
}
