import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CurrencyCode } from '../../types/financial';
import { calculateMortgage } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

interface LoanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
}

export const LoanComparisonModal: React.FC<LoanComparisonModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  const [optionA, setOptionA] = useState({
    price: 400000,
    downPct: 20,
    term: 30,
    rate: 6.5,
  });

  const [optionB, setOptionB] = useState({
    price: 400000,
    downPct: 20,
    term: 15,
    rate: 5.75,
  });

  if (!isOpen) return null;

  const resA = calculateMortgage({
    homePrice: optionA.price,
    downPaymentPercent: optionA.downPct,
    loanTermYears: optionA.term,
    interestRate: optionA.rate,
    propertyTaxAnnual: 4800,
    homeInsuranceAnnual: 1400,
    pmiPercent: 0.5,
    hoaMonthly: 0,
    extraMonthlyPayment: 0,
  });

  const resB = calculateMortgage({
    homePrice: optionB.price,
    downPaymentPercent: optionB.downPct,
    loanTermYears: optionB.term,
    interestRate: optionB.rate,
    propertyTaxAnnual: 4800,
    homeInsuranceAnnual: 1400,
    pmiPercent: 0.5,
    hoaMonthly: 0,
    extraMonthlyPayment: 0,
  });

  const interestDiff = Math.abs(resA.totalInterestPaid - resB.totalInterestPaid);
  const monthlyDiff = Math.abs(resA.totalMonthlyPayment - resB.totalMonthlyPayment);
  const optionBSavesInterest = resB.totalInterestPaid < resA.totalInterestPaid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Side-by-Side Loan Comparison</h2>
            <p className="text-xs text-slate-500">
              Evaluate trade-offs between rates, terms, and down payments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-sm font-bold text-slate-900">Option A (e.g. 30-Yr Fixed)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">Home Price</label>
                  <input
                    type="number"
                    value={optionA.price}
                    onChange={(e) =>
                      setOptionA((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Down Payment (%)</label>
                  <input
                    type="number"
                    value={optionA.downPct}
                    onChange={(e) =>
                      setOptionA((p) => ({ ...p, downPct: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Term (Years)</label>
                  <input
                    type="number"
                    value={optionA.term}
                    onChange={(e) =>
                      setOptionA((p) => ({ ...p, term: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={optionA.rate}
                    onChange={(e) =>
                      setOptionA((p) => ({ ...p, rate: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Payment:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(resA.totalMonthlyPayment, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Interest:</span>
                  <span className="font-semibold text-rose-600 font-mono">
                    {formatCurrency(resA.totalInterestPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Cost:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {formatCurrency(resA.totalCostOfLoan, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Option B */}
            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="text-sm font-bold text-indigo-950">Option B (e.g. 15-Yr Fixed)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1">Home Price</label>
                  <input
                    type="number"
                    value={optionB.price}
                    onChange={(e) =>
                      setOptionB((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Down Payment (%)</label>
                  <input
                    type="number"
                    value={optionB.downPct}
                    onChange={(e) =>
                      setOptionB((p) => ({ ...p, downPct: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Term (Years)</label>
                  <input
                    type="number"
                    value={optionB.term}
                    onChange={(e) =>
                      setOptionB((p) => ({ ...p, term: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={optionB.rate}
                    onChange={(e) =>
                      setOptionB((p) => ({ ...p, rate: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Payment:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(resB.totalMonthlyPayment, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Interest:</span>
                  <span className="font-semibold text-rose-600 font-mono">
                    {formatCurrency(resB.totalInterestPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Cost:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {formatCurrency(resB.totalCostOfLoan, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Verdict */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">
                {optionBSavesInterest ? 'Option B saves' : 'Option A saves'}{' '}
                {formatCurrency(interestDiff, currency)} in total interest!
              </p>
              <p className="text-xs text-emerald-800 mt-1">
                {optionBSavesInterest
                  ? `However, Option B requires an additional ${formatCurrency(monthlyDiff, currency)} per month in payments.`
                  : `Option A gives lower monthly payments and saves interest overall.`}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
