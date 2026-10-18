import { Printer, X, Check } from 'lucide-react';
import { PrintJob, ShopSettings } from '../types/index.ts';
import { formatCurrency } from '../utils/pricing.ts';
import { QRCodeView } from './QRCodeView.tsx';

interface PrintReceiptModalProps {
  job: PrintJob;
  settings: ShopSettings;
  onClose: () => void;
}

export function PrintReceiptModal({ job, settings, onClose }: PrintReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700">প্রিন্ট রিসিট / টোকেন স্লিপ</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div
            id="thermal-receipt"
            className="bg-white border border-slate-200 rounded-lg p-5 font-sans text-xs shadow-xs text-slate-800 space-y-3"
          >
            {/* Shop Heading */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-bold text-slate-900">{settings.shopName}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.tagline}</p>
              <p className="text-[11px] text-slate-600 mt-1">মোবাইল: {settings.shopPhone}</p>
              <p className="text-[10px] text-slate-400">{settings.shopAddress}</p>
            </div>

            {/* Token & PIN Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center my-2">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">টোকেন নাম্বার</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight my-1">
                {job.tokenNumber}
              </div>
              <div className="text-[11px] text-slate-600">
                নিরাপত্তা পিন: <span className="font-bold text-slate-900">{job.pinCode}</span>
              </div>
            </div>

            {/* Customer & Timestamp */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-200 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">গ্রাহক:</span>
                <span className="font-semibold text-slate-800">{job.customerName}</span>
              </div>
              {job.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">মোবাইল:</span>
                  <span>{job.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ ও সময়:</span>
                <span>{new Date(job.createdAt).toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-200 pb-2">
              <div className="flex justify-between font-medium">
                <span className="truncate max-w-[200px]">{job.fileName}</span>
                <span>{job.options.copies} কপি</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>
                  {job.options.colorMode === 'color' ? 'রঙিন' : 'সাদা-কালো'} · {job.options.paperSize} ·{' '}
                  {job.options.duplex === 'double' ? 'উভয় পিঠ' : 'এক পিঠ'}
                </span>
                <span>{job.costBreakdown.effectivePages} পৃষ্ঠা</span>
              </div>
              {job.options.binding !== 'none' && (
                <div className="flex justify-between text-slate-500">
                  <span>বাইন্ডিং / ফিনিশিং ({job.options.binding})</span>
                  <span>{formatCurrency(job.costBreakdown.bindingCost, settings.currency)}</span>
                </div>
              )}
            </div>

            {/* Totals & Payment */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-sm font-bold">
                <span>মোট দেয় বিল:</span>
                <span className="tabular-nums">
                  {formatCurrency(job.costBreakdown.totalCost, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
                <span
                  className={`font-semibold ${
                    job.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {job.paymentStatus === 'paid' ? '✓ পরিশোধিত (PAID)' : 'বাকি / কাউন্টারে প্রদেয়'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>পদ্ধতি:</span>
                <span className="capitalize">{job.paymentMethod}</span>
              </div>
            </div>

            {/* QR verification */}
            <div className="flex flex-col items-center pt-2 border-t border-dashed border-slate-200">
              <QRCodeView value={`print-token:${job.tokenNumber}:${job.pinCode}`} size={80} />
              <p className="text-[10px] text-slate-400 mt-1">কাউন্টার স্ক্যান ভেরিফিকেশন</p>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              আমাদের প্রিন্টিং সেবায় আপনাকে স্বাগতম!
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            রিসিট প্রিন্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
