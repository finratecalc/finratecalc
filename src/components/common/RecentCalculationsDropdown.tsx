import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Trash2,
  X,
  ArrowRight,
  Clock,
  Home,
  CreditCard,
  TrendingUp,
  Car,
  Layers,
  Percent,
  DollarSign,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { CalculationHistoryItem, CalculatorId } from '../../types/financial';
import {
  getRecentCalculations,
  deleteRecentCalculation,
  clearRecentCalculations,
  formatTimeAgo,
  RECENT_CALCULATIONS_EVENT,
} from '../../utils/recentCalculations';

interface RecentCalculationsDropdownProps {
  onRestoreCalculation: (item: CalculationHistoryItem) => void;
}

export const RecentCalculationsDropdown: React.FC<RecentCalculationsDropdownProps> = ({
  onRestoreCalculation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<CalculationHistoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync history from storage & custom events
  useEffect(() => {
    setHistoryItems(getRecentCalculations());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CalculationHistoryItem[]>;
      if (customEvent.detail) {
        setHistoryItems(customEvent.detail);
      } else {
        setHistoryItems(getRecentCalculations());
      }
    };

    window.addEventListener(RECENT_CALCULATIONS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(RECENT_CALCULATIONS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteRecentCalculation(id);
    setHistoryItems(updated);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentCalculations();
    setHistoryItems([]);
  };

  const getCalculatorIcon = (id: CalculatorId) => {
    switch (id) {
      case 'mortgage':
        return <Home className="w-4 h-4 text-indigo-600" />;
      case 'loan':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'auto-loan':
        return <Car className="w-4 h-4 text-amber-600" />;
      case 'retirement':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'amortization':
        return <Layers className="w-4 h-4 text-teal-600" />;
      case 'inflation':
        return <Percent className="w-4 h-4 text-rose-600" />;
      case 'salary':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
          isOpen
            ? 'bg-slate-100 text-slate-900 border-slate-300'
            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
        }`}
        title="View Recent Calculations"
        aria-expanded={isOpen}
      >
        <History className="w-3.5 h-3.5 text-slate-500" />
        <span className="hidden sm:inline">Recent</span>
        {historyItems.length > 0 && (
          <span className="flex items-center justify-center px-1.5 py-0.2 min-w-[16px] text-[10px] font-bold text-white bg-indigo-600 rounded-full font-mono">
            {historyItems.length}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Recent Calculations</span>
              {historyItems.length > 0 && (
                <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {historyItems.length}/5 saved
                </span>
              )}
            </div>

            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                title="Clear all recent calculations"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* List or Empty State */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {historyItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <History className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No recent calculations yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                  As you adjust parameters in any calculator, your last 5 calculations will be preserved here so you can jump back instantly.
                </p>
              </div>
            ) : (
              historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onRestoreCalculation(item);
                    setIsOpen(false);
                  }}
                  className="group px-4 py-2.5 hover:bg-indigo-50/50 cursor-pointer transition-colors flex items-start justify-between gap-3 text-left"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-100/70 transition-colors mt-0.5 shrink-0">
                      {getCalculatorIcon(item.calculatorId)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {item.calculatorTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 font-mono tabular-nums mt-0.5">
                        {item.primarySummary}
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                        {item.subSummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-medium text-indigo-600 hidden group-hover:inline flex items-center gap-0.5">
                      Restore <ArrowRight className="w-2.5 h-2.5 inline" />
                    </span>
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-slate-200/60 rounded transition-colors ml-1"
                      title="Remove from history"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Hint */}
          {historyItems.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Click any row to jump back and restore inputs
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
