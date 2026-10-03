import React, { useRef, useState } from 'react';
import { X, Download, Printer, Loader2, CheckCircle2, FileText, Calendar, User } from 'lucide-react';
import { CurrencyCode, AmortizationPeriod } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';
import { exportElementToPdf } from '../../utils/pdfExport';
import { SvgDonutChart, DonutSlice } from './SvgDonutChart';
import { SvgLineAreaChart, AreaSeries } from './SvgLineAreaChart';

export interface ReportMetric {
  label: string;
  value: string;
  subtext?: string;
  isPrimary?: boolean;
}

export interface ReportParameter {
  label: string;
  value: string;
}

export interface ReportChartData {
  donut?: {
    title: string;
    slices: DonutSlice[];
  };
  trajectory?: {
    title: string;
    subtitle?: string;
    xLabels: string[];
    series: AreaSeries[];
  };
}

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorTitle: string;
  currency: CurrencyCode;
  metrics: ReportMetric[];
  parameters: ReportParameter[];
  charts?: ReportChartData;
  annualSchedule?: AmortizationPeriod[];
  summaryNote?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  calculatorTitle,
  currency,
  metrics,
  parameters,
  charts,
  annualSchedule,
  summaryNote,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [reportNote, setReportNote] = useState<string>('');
  const [includeSchedule, setIncludeSchedule] = useState<'annual' | 'none'>('annual');
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      setIsDownloaded(false);
      const cleanName = calculatorTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await exportElementToPdf(
        reportRef.current,
        `${cleanName}-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        (step) => setExportStep(step)
      );
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('PDF generation encountered an error. Please try again or use the Print button.');
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Modal Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official PDF Report Generator
              </h2>
              <p className="text-xs text-slate-500">
                Formatted statement with executive summary, charts, and amortization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{exportStep || 'Generating PDF...'}</span>
                </>
              ) : isDownloaded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Report as PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Drawer: Client Name & Notes */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Prepared for (e.g. John Doe, 123 Maple St)..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Add memo or loan reference..."
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              className="w-full bg-white border border-slate-200 px-2.5 py-1 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {annualSchedule && annualSchedule.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 font-medium">Schedule:</span>
              <select
                value={includeSchedule}
                onChange={(e) => setIncludeSchedule(e.target.value as 'annual' | 'none')}
                className="bg-white border border-slate-200 px-2 py-1 rounded-md text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="annual">Include Annual Schedule</option>
                <option value="none">Executive Summary Only</option>
              </select>
            </div>
          )}
        </div>

        {/* Document Preview Canvas (Target of PDF generation) */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            ref={reportRef}
            className="bg-white w-[800px] p-8 border border-slate-200 shadow-md space-y-6 text-slate-900 font-sans"
            style={{ minHeight: '1050px' }}
          >
            {/* Document Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                    FinRate<span className="text-emerald-600">Calc</span><span className="text-xs text-slate-400 font-normal">.com</span>
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    Financial Statement
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-2 font-sans">
                  {calculatorTitle} Report
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated via FinRateCalc Institutional Analytics Engine
                </p>
              </div>

              <div className="text-right text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-end gap-1.5 font-medium text-slate-900">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{currentDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">Currency:</span>{' '}
                  <span className="font-semibold text-slate-900">{currency}</span>
                </div>
                {clientName && (
                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Prepared for:</span>{' '}
                    <span className="font-semibold text-slate-900">{clientName}</span>
                  </div>
                )}
                {reportNote && (
                  <div className="text-[11px] text-slate-500 italic max-w-xs">
                    "{reportNote}"
                  </div>
                )}
              </div>
            </div>

            {/* Key Results / Executive Summary Cards */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Executive Results Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border ${
                      m.isPrimary
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-500 block">
                      {m.label}
                    </span>
                    <span
                      className={`text-lg font-bold font-mono tabular-nums block mt-1 ${
                        m.isPrimary ? 'text-indigo-900' : 'text-slate-900'
                      }`}
                    >
                      {m.value}
                    </span>
                    {m.subtext && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {m.subtext}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Calculation Input Parameters
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs">
                {parameters.map((p, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">{p.label}:</span>
                    <span className="font-semibold font-mono tabular-nums text-slate-900">
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            {charts && (
              <div className="space-y-4 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  Visual Breakdown & Trajectory
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Donut Chart */}
                  {charts.donut && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-white">
                      <h3 className="text-xs font-semibold text-slate-800 mb-1">
                        {charts.donut.title}
                      </h3>
                      <SvgDonutChart
                        slices={charts.donut.slices}
                        currency={currency}
                        size={190}
                      />
                    </div>
                  )}

                  {/* Trajectory Area Chart */}
                  {charts.trajectory && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-white">
                      <h3 className="text-xs font-semibold text-slate-800 mb-1">
                        {charts.trajectory.title}
                      </h3>
                      {charts.trajectory.subtitle && (
                        <p className="text-[10px] text-slate-500 mb-2">
                          {charts.trajectory.subtitle}
                        </p>
                      )}
                      <SvgLineAreaChart
                        xLabels={charts.trajectory.xLabels}
                        series={charts.trajectory.series}
                        currency={currency}
                        height={200}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amortization Schedule Table */}
            {includeSchedule === 'annual' && annualSchedule && annualSchedule.length > 0 && (
              <div className="pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Annual Amortization Progression
                </h2>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-3">Period</th>
                        <th className="py-1.5 px-3 text-right">Annual Payment</th>
                        <th className="py-1.5 px-3 text-right">Principal</th>
                        <th className="py-1.5 px-3 text-right">Interest</th>
                        <th className="py-1.5 px-3 text-right">Total Interest</th>
                        <th className="py-1.5 px-3 text-right">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                      {annualSchedule.slice(0, 30).map((row) => (
                        <tr key={row.period} className="even:bg-slate-50/50">
                          <td className="py-1.5 px-3 font-sans font-medium text-slate-900">
                            {row.label}
                          </td>
                          <td className="py-1.5 px-3 text-right text-slate-700">
                            {formatCurrency(row.payment, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">
                            {formatCurrency(row.principal, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-right text-rose-700">
                            {formatCurrency(row.interest, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-right text-slate-500">
                            {formatCurrency(row.totalInterest, currency)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-medium text-slate-900">
                            {formatCurrency(row.remainingBalance, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Note / Disclaimer Footer */}
            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed space-y-1">
              {summaryNote && <p className="text-slate-600 italic">{summaryNote}</p>}
              <p>
                <strong>Disclaimer:</strong> This financial calculation report is prepared for informational and estimation purposes based on prevailing mathematical amortization and compounding models. Actual lender terms, taxes, insurance premiums, and market returns may vary.
              </p>
              <div className="flex items-center justify-between pt-2 text-slate-400 text-[9px]">
                <span>FinRateCalc Analytics Engine</span>
                <span>Document ID: FRC-{Date.now().toString(36).toUpperCase()}</span>
                <span>Confidential / Personal Record</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
