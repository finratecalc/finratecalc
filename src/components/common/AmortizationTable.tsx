import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { AmortizationPeriod, CurrencyCode } from '../../types/financial';
import { formatCurrency, exportToCSV } from '../../utils/formatters';

interface AmortizationTableProps {
  annualSchedule: AmortizationPeriod[];
  monthlySchedule: AmortizationPeriod[];
  currency: CurrencyCode;
  title?: string;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  annualSchedule,
  monthlySchedule,
  currency,
  title = 'Amortization Schedule',
}) => {
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const currentData = viewMode === 'annual' ? annualSchedule : monthlySchedule;

  const filteredData = currentData.filter((item) => {
    if (!search.trim()) return true;
    return item.label.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleExportCSV = () => {
    const hasExtraPayment = currentData.some((d) => (d.extraPayment || 0) > 0);
    const headers = [
      'Period',
      `Payment (${currency})`,
      `Principal (${currency})`,
      `Interest (${currency})`,
      ...(hasExtraPayment ? [`Extra Principal (${currency})`] : []),
      `Total Interest Paid (${currency})`,
      `Remaining Balance (${currency})`,
    ];
    const rows = currentData.map((d) => [
      d.label,
      d.payment.toFixed(2),
      d.principal.toFixed(2),
      d.interest.toFixed(2),
      ...(hasExtraPayment ? [(d.extraPayment || 0).toFixed(2)] : []),
      d.totalInterest.toFixed(2),
      d.remainingBalance.toFixed(2),
    ]);
    exportToCSV(`fincalc-amortization-${viewMode}`, [headers, ...rows]);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            {viewMode === 'annual'
              ? `${annualSchedule.length} years duration`
              : `${monthlySchedule.length} total monthly payments`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented view switcher */}
          <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setViewMode('annual');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Schedule
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Breakdown
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            title="Download CSV spreadsheet for Excel or Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Filter by ${viewMode === 'annual' ? 'year (e.g. Year 5)' : 'month (e.g. Month 24)'}...`}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <span className="text-slate-500 font-mono text-[11px] tabular-nums hidden sm:inline">
          Showing {paginatedData.length} of {filteredData.length} records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100/75 text-slate-600 border-b border-slate-200 font-medium">
            <tr>
              <th className="py-2.5 px-3">Period</th>
              <th className="py-2.5 px-3 text-right">Payment</th>
              <th className="py-2.5 px-3 text-right">Principal</th>
              <th className="py-2.5 px-3 text-right">Interest</th>
              <th className="py-2.5 px-3 text-right">Total Interest</th>
              <th className="py-2.5 px-3 text-right">Ending Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                  No records match your search filter
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.period} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{row.label}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">
                    {formatCurrency(row.payment, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                    {formatCurrency(row.principal, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600">
                    {formatCurrency(row.interest, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {formatCurrency(row.totalInterest, currency)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                    {formatCurrency(row.remainingBalance, currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50/50">
          <span className="text-slate-500">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <button
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
