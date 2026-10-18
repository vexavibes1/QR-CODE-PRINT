import { useState, useMemo } from 'react';
import {
  Printer,
  Search,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  Receipt,
  Trash2,
  Settings,
  Tv,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { PrintJob, ShopSettings, JobStatus } from '../types/index.ts';
import { formatCurrency } from '../utils/pricing.ts';

interface OperatorDashboardProps {
  jobs: PrintJob[];
  settings: ShopSettings;
  onUpdateJob: (id: string, updates: Partial<PrintJob>) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onPreviewJob: (job: PrintJob) => void;
  onPrintReceipt: (job: PrintJob) => void;
  onOpenSettings: () => void;
  onOpenKiosk: () => void;
  onOpenCustomerView: () => void;
}

export function OperatorDashboard({
  jobs,
  settings,
  onUpdateJob,
  onDeleteJob,
  onPreviewJob,
  onPrintReceipt,
  onOpenSettings,
  onOpenKiosk,
  onOpenCustomerView,
}: OperatorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.tokenNumber.toLowerCase().includes(q) ||
        job.customerName.toLowerCase().includes(q) ||
        job.fileName.toLowerCase().includes(q) ||
        (job.customerPhone && job.customerPhone.includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, searchQuery]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const total = jobs.length;
    const pending = jobs.filter((j) => j.status === 'pending').length;
    const printing = jobs.filter((j) => j.status === 'printing').length;
    const completed = jobs.filter((j) => j.status === 'completed').length;
    const totalRevenue = jobs
      .filter((j) => j.paymentStatus === 'paid')
      .reduce((sum, j) => sum + j.costBreakdown.totalCost, 0);

    return { total, pending, printing, completed, totalRevenue };
  }, [jobs]);

  const handlePrintJobDirect = (job: PrintJob) => {
    // Automatically set status to 'printing' if pending
    if (job.status === 'pending') {
      onUpdateJob(job.id, { status: 'printing' });
    }
    onPreviewJob(job);
  };

  const togglePayment = (job: PrintJob) => {
    const nextStatus = job.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    onUpdateJob(job.id, { paymentStatus: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>অপেক্ষমাণ কিউ (Pending)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">{stats.pending}</span>
            <span className="text-xs text-slate-500">টি ফাইল</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>প্রিন্ট রানিং (Printing)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-700 tabular-nums">{stats.printing}</span>
            <span className="text-xs text-slate-500">টি রানিং</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>সম্পন্ন প্রিন্ট (Done)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 tabular-nums">{stats.completed}</span>
            <span className="text-xs text-slate-500">টি ডেলিভারি</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>আজকের মোট আয়</span>
            <span className="text-indigo-600 font-bold">৳</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {formatCurrency(stats.totalRevenue, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="টোকেন (P-101), নাম বা ফাইলের নাম..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সব ({jobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'pending'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            অপেক্ষমাণ ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter('printing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'printing'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            প্রিন্ট হচ্ছে ({stats.printing})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            সম্পন্ন ({stats.completed})
          </button>
        </div>

        {/* Navigation Quick Shortcuts */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenCustomerView}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="গ্রাহকের মোবাইল ভিউ খুলুন"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            কাস্টমার ভিউ
          </button>
          <button
            onClick={onOpenKiosk}
            className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            title="দোকানের ডিসপ্লে স্ক্রিন খুলুন"
          >
            <Tv className="w-3.5 h-3.5" />
            কিওস্ক স্ক্রিন
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="রেট ও দোকান সেটিংস"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jobs Queue Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <Printer className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">কোনো প্রিন্ট রিকোয়েস্ট নেই</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                গ্রাহক যখন কিউআর কোড স্ক্যান করে ফাইল আপলোড করবে, সাথে সাথে এই কিউতে দেখা যাবে।
              </p>
            </div>
            <button
              onClick={onOpenCustomerView}
              className="mt-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              + টেস্ট ফাইল আপলোড করুন
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left zone: Token, Customer & File Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl w-16 h-16 shrink-0 shadow-xs">
                    <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">
                      টোকেন
                    </span>
                    <span className="text-xl font-black tracking-tight">{job.tokenNumber}</span>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">{job.fileName}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({(job.fileSize / 1024).toFixed(0)} KB)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{job.customerName}</span>
                      {job.customerPhone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{job.customerPhone}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[11px] font-mono text-slate-400">PIN: {job.pinCode}</span>
                    </div>

                    {/* Options summary */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span
                        className={`font-semibold ${
                          job.options.colorMode === 'color' ? 'text-indigo-600' : 'text-slate-700'
                        }`}
                      >
                        {job.options.colorMode === 'color' ? '🎨 কালার' : '📄 সাদা-কালো'}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">|</span>
                      <span className="text-slate-600">{job.options.paperSize}</span>
                      <span aria-hidden="true" className="text-slate-300">|</span>
                      <span className="text-slate-600 tabular-nums">
                        {job.options.copies} কপি × {job.costBreakdown.effectivePages} পৃ.
                      </span>
                      <span aria-hidden="true" className="text-slate-300">|</span>
                      <span className="text-slate-600">
                        {job.options.duplex === 'double' ? 'উভয় পিঠ' : 'এক পিঠ'}
                      </span>
                      {job.options.binding !== 'none' && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">|</span>
                          <span className="text-amber-700 font-medium">{job.options.binding}</span>
                        </>
                      )}
                    </div>

                    {job.notes && (
                      <p className="text-xs text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-block mt-1">
                        নোট: {job.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle zone: Bill & Payment status */}
                <div className="flex items-center gap-4 lg:px-4 shrink-0">
                  <div className="text-left lg:text-right">
                    <div className="text-base font-black text-slate-900 tabular-nums">
                      {formatCurrency(job.costBreakdown.totalCost, settings.currency)}
                    </div>
                    <button
                      onClick={() => togglePayment(job)}
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition-colors ${
                        job.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                      title="পেমেন্ট স্ট্যাটাস টগল করতে ক্লিক করুন"
                    >
                      {job.paymentStatus === 'paid' ? '✓ পেইড' : 'বাকি'} · {job.paymentMethod}
                    </button>
                  </div>
                </div>

                {/* Right zone: Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status Progress Button */}
                  {job.status === 'pending' && (
                    <button
                      onClick={() => onUpdateJob(job.id, { status: 'printing' })}
                      className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      প্রিন্ট শুরু
                    </button>
                  )}

                  {job.status === 'printing' && (
                    <button
                      onClick={() => onUpdateJob(job.id, { status: 'completed' })}
                      className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      প্রস্তুত / সম্পন্ন
                    </button>
                  )}

                  {job.status === 'completed' && (
                    <button
                      onClick={() => onUpdateJob(job.id, { status: 'pending' })}
                      className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                      title="পুনরায় কিউতে পাঠান"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Print Document directly */}
                  <button
                    onClick={() => handlePrintJobDirect(job)}
                    className="px-3.5 py-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                    title="প্রিন্টারে প্রিন্ট দিন"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    প্রিন্ট দিন
                  </button>

                  {/* View Preview */}
                  <button
                    onClick={() => onPreviewJob(job)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    title="ফাইল প্রিভিউ দেখুন"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Print Slip / Receipt */}
                  <button
                    onClick={() => onPrintReceipt(job)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    title="রিসিট স্লিপ প্রিন্ট করুন"
                  >
                    <Receipt className="w-4 h-4" />
                  </button>

                  {/* Delete Job */}
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
