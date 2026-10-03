import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { CalculatorId } from '../../types/financial';
import { CALCULATOR_FAQS, FaqItem } from '../../data/calculatorFaqs';

interface CalculatorFaqProps {
  activeCalculator: CalculatorId | 'directory';
  onSelectCalculator?: (id: CalculatorId | 'directory') => void;
}

export const CalculatorFaq: React.FC<CalculatorFaqProps> = ({
  activeCalculator,
  onSelectCalculator,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const faqData = CALCULATOR_FAQS[activeCalculator] || CALCULATOR_FAQS.mortgage;

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    faqData.items.forEach((item) => {
      allExpanded[item.id] = true;
    });
    setExpandedItems(allExpanded);
  };

  const collapseAll = () => {
    setExpandedItems({});
  };

  return (
    <div className="w-full bg-slate-50/80 border-t border-slate-200 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toggle Bar / Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {faqData.title}
                </h3>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Expert Tips
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{faqData.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isOpen && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button
                  onClick={expandAll}
                  className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Expand all
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={collapseAll}
                  className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Collapse all
                </button>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              aria-expanded={isOpen}
            >
              <span>{isOpen ? 'Hide FAQ & Tips' : 'Show FAQ & Tips'}</span>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div className="mt-6 space-y-3.5 animate-in fade-in duration-200">
            {faqData.items.map((item: FaqItem, idx: number) => {
              // Expand the first item by default if nothing set yet
              const isItemOpen =
                expandedItems[item.id] !== undefined ? expandedItems[item.id] : idx === 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all duration-150"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-mono font-medium shrink-0">
                        {idx + 1}
                      </span>
                      {item.tag && (
                        <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider font-mono shrink-0">
                          {item.tag}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-slate-900 truncate sm:whitespace-normal">
                        {item.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                        {isItemOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isItemOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-white">
                      <p className="text-slate-600 mb-3">{item.answer}</p>

                      {/* Pro Tip Box */}
                      {item.proTip && (
                        <div className="mt-3.5 p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-2.5">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs text-indigo-950 leading-normal">
                            <span className="font-semibold text-indigo-900 block mb-0.5">
                              Pro Tip / Rule of Thumb
                            </span>
                            {item.proTip}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Other topics quick links */}
            {onSelectCalculator && (
              <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Explore tips for other tools:</span>
                {(
                  [
                    { id: 'mortgage', label: 'Mortgage' },
                    { id: 'loan', label: 'Personal Loans' },
                    { id: 'investment', label: 'Investing' },
                    { id: 'auto-loan', label: 'Auto Financing' },
                    { id: 'retirement', label: '401(k)' },
                    { id: 'amortization', label: 'Extra Payoffs' },
                    { id: 'inflation', label: 'Inflation' },
                    { id: 'salary', label: 'Take-Home Pay' },
                  ] as const
                )
                  .filter((cat) => cat.id !== activeCalculator)
                  .slice(0, 4)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCalculator(cat.id)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-md transition-colors font-medium text-slate-600 inline-flex items-center gap-1"
                    >
                      <span>{cat.label}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
