import React, { useState } from 'react';
import {
  Home,
  CreditCard,
  TrendingUp,
  Car,
  Clock,
  Percent,
  DollarSign,
  Layers,
  ArrowRight,
  Search,
  ShieldCheck,
  Award,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  Building2,
  Scale,
} from 'lucide-react';
import { CalculatorId, CalculatorMeta } from '../../types/financial';

interface CalculatorDirectoryProps {
  onSelectCalculator: (id: CalculatorId) => void;
}

export const ALL_CALCULATORS: (CalculatorMeta & { usTag: string; badge?: string })[] = [
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    shortDesc: 'Compute monthly P&I, property taxes, homeowners insurance, PMI, and HOA fees with full amortization schedules.',
    category: 'Mortgage & Housing',
    icon: 'home',
    usTag: '30 & 15-Yr Fixed, FHA, VA',
    badge: 'Most Popular',
  },
  {
    id: 'loan',
    name: 'Personal & Term Loan Calculator',
    shortDesc: 'Analyze monthly, bi-weekly, or weekly loan payments, interest amortization, and total cost of borrowing.',
    category: 'Loans & Debt',
    icon: 'credit-card',
    usTag: 'APR & Debt Consolidation',
  },
  {
    id: 'investment',
    name: 'Compound Interest & Investing',
    shortDesc: 'Simulate multidecade wealth creation with index funds, recurring contributions, and compounding intervals.',
    category: 'Investing & Growth',
    icon: 'trending-up',
    usTag: 'S&P 500 Historical 10.2%',
    badge: 'Wealth Builder',
  },
  {
    id: 'auto-loan',
    name: 'Auto Loan & Trade-In Calculator',
    shortDesc: 'Evaluate new or used car financing, trade-in sales tax credit, dealer fees, and monthly car notes.',
    category: 'Loans & Debt',
    icon: 'car',
    usTag: '20/4/10 Rule Compatible',
  },
  {
    id: 'retirement',
    name: '401(k) & Retirement Planner',
    shortDesc: 'Forecast retirement nest eggs, employer 401(k) match leverage, salary step-ups, and the 4% safe withdrawal rule.',
    category: 'Retirement & Life',
    icon: 'clock',
    usTag: '2024 IRS Limits ($23,000)',
    badge: 'Essential',
  },
  {
    id: 'amortization',
    name: 'Extra Principal & Early Payoff',
    shortDesc: 'Discover how adding $100–$500/month directly to principal shaves 5–8 years off your mortgage and saves tens of thousands.',
    category: 'Loans & Debt',
    icon: 'layers',
    usTag: 'Principal-Only Acceleration',
  },
  {
    id: 'inflation',
    name: 'US Inflation & Purchasing Power',
    shortDesc: 'Measure how consumer price inflation (CPI) erodes cash purchasing power and discover future purchasing equivalents.',
    category: 'Investing & Growth',
    icon: 'percent',
    usTag: 'CPI-U Benchmarked',
  },
  {
    id: 'salary',
    name: 'Salary & Take-Home Pay (W-4)',
    shortDesc: 'Convert gross annual or hourly salary into net take-home pay after federal income taxes, FICA (Social Security & Medicare), and state taxes.',
    category: 'Retirement & Life',
    icon: 'dollar-sign',
    usTag: 'Federal & FICA Aligned',
  },
];

export const CalculatorDirectory: React.FC<CalculatorDirectoryProps> = ({ onSelectCalculator }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Mortgage & Housing', 'Loans & Debt', 'Investing & Growth', 'Retirement & Life'];

  const filtered = ALL_CALCULATORS.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.usTag.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'credit-card':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'trending-up':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'car':
        return <Car className="w-5 h-5 text-amber-600" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-purple-600" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-teal-600" />;
      case 'percent':
        return <Percent className="w-5 h-5 text-rose-600" />;
      case 'dollar-sign':
      default:
        return <DollarSign className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section: US Financial Authority Portal */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl text-white border border-slate-800 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative p-6 sm:p-10 lg:p-12">
          {/* Top trust badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FinRateCalc.com · Official Financial Modeling Suite</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Make Confident Financial Decisions with{' '}
            <span className="text-emerald-400">Institutional Precision.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Free, bank-grade calculators designed for US homebuyers, borrowers, and investors. Compute mortgages, auto loans, 401(k) nest eggs, and compound growth with transparent actuarial formulas.
          </p>

          {/* Quick decision actions */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onSelectCalculator('mortgage')}
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Home className="w-4 h-4 text-emerald-400" />
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all" />
              </div>
              <span className="text-xs font-bold text-white block">Home Mortgage</span>
              <span className="text-[11px] text-slate-400 font-mono">30-Yr @ 6.62%</span>
            </button>

            <button
              onClick={() => onSelectCalculator('investment')}
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-400 transition-all" />
              </div>
              <span className="text-xs font-bold text-white block">Compound Wealth</span>
              <span className="text-[11px] text-slate-400 font-mono">S&P 500 DCA</span>
            </button>

            <button
              onClick={() => onSelectCalculator('retirement')}
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-purple-400 transition-all" />
              </div>
              <span className="text-xs font-bold text-white block">401(k) Retirement</span>
              <span className="text-[11px] text-slate-400 font-mono">4% Rule Ready</span>
            </button>

            <button
              onClick={() => onSelectCalculator('salary')}
              className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-400 transition-all" />
              </div>
              <span className="text-xs font-bold text-white block">Take-Home Pay</span>
              <span className="text-[11px] text-slate-400 font-mono">Federal & FICA</span>
            </button>
          </div>

          {/* Search bar inside hero */}
          <div className="mt-8 relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search US calculators (e.g., mortgage, 401k, car loan, salary, inflation)..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 text-white rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Bottom feature stats strip */}
        <div className="bg-slate-950/70 border-t border-slate-800/80 px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free · No Registration Required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF Reports & Excel CSV Export Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>CFPB & Federal Reserve Benchmarked</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectCalculator(item.id)}
            className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 group-hover:bg-emerald-500 transition-colors"></div>

            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors shrink-0">
                  {renderIcon(item.icon)}
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-sans">
                    {item.badge}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {item.name}
              </h3>

              <div className="mt-1">
                <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                  {item.usTag}
                </span>
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {item.shortDesc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
              <span>Calculate Now</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-sm font-semibold text-slate-700">No calculators found matching "{searchTerm}"</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for mortgage, loan, 401k, or salary.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* US Trust Standards Banner */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Standardized US Financial Standards</h3>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            All calculations utilize standardized formulas consistent with the Consumer Financial Protection Bureau (CFPB), IRS publication guidelines, Freddie Mac Primary Mortgage Market Surveys, and Federal Reserve benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-900 block">Bank-Grade Precision</span>
            <span className="text-[11px] text-slate-500">100% Client-Side Privacy</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
