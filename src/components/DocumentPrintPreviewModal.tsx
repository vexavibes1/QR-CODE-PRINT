import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { PrintJob, ShopSettings } from '../types/index.ts';
import { formatCurrency } from '../utils/pricing.ts';

interface DocumentPrintPreviewModalProps {
  job: PrintJob;
  settings: ShopSettings;
  onClose: () => void;
  onMarkPrinted?: (id: string) => void;
}

export function DocumentPrintPreviewModal({
  job,
  settings,
  onClose,
  onMarkPrinted,
}: DocumentPrintPreviewModalProps) {
  const isImageOrSvg =
    job.fileData &&
    (job.fileData.startsWith('data:image/') ||
      job.fileData.startsWith('http') ||
      job.fileType.startsWith('image/'));

  const handlePrint = () => {
    // Notify parent to set status to printing/completed if desired
    if (onMarkPrinted) {
      onMarkPrinted(job.id);
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {job.tokenNumber}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{job.fileName}</span>
                <span className="text-xs font-medium text-slate-500">
                  ({(job.fileSize / 1024).toFixed(0)} KB)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                গ্রাহক: {job.customerName} {job.customerPhone ? `· ${job.customerPhone}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Settings Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-6 py-3 bg-slate-100/70 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">প্রিন্ট মোড</span>
            <span className="font-semibold text-slate-800">
              {job.options.colorMode === 'color' ? '🎨 রঙিন (Color)' : '📄 সাদা-কালো (B&W)'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">কাগজের সাইজ</span>
            <span className="font-semibold text-slate-800">{job.options.paperSize}</span>
          </div>
          <div>
            <span className="text-slate-500 block">কপি ও পৃষ্ঠা</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {job.options.copies} কপি × {job.costBreakdown.effectivePages} পৃ.
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">প্রিন্টিং সাইড</span>
            <span className="font-semibold text-slate-800">
              {job.options.duplex === 'double' ? 'উভয় পিঠ (Duplex)' : 'এক পিঠ (Single)'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">মোট বিল</span>
            <span className="font-bold text-indigo-700 tabular-nums">
              {formatCurrency(job.costBreakdown.totalCost, settings.currency)}
            </span>
          </div>
        </div>

        {/* Document Preview Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-slate-200/50 flex items-center justify-center min-h-[350px]">
          <div
            id="printable-document-area"
            className={`bg-white shadow-lg p-6 max-w-full rounded-md border border-slate-300 transition-all ${
              job.options.colorMode === 'bw' ? 'filter grayscale contrast-125' : ''
            }`}
            style={{
              width: job.options.orientation === 'landscape' ? '680px' : '520px',
              minHeight: job.options.orientation === 'landscape' ? '460px' : '640px',
            }}
          >
            {isImageOrSvg ? (
              <div className="flex flex-col items-center justify-center">
                <img
                  src={job.fileData}
                  alt={job.fileName}
                  className="max-h-[500px] w-auto object-contain border border-slate-100 shadow-xs"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{job.fileName}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    মোট পৃষ্ঠা: {job.costBreakdown.effectivePages} · ফরম্যাট: {job.fileType}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-600 text-left w-full border border-slate-200">
                  <p className="font-medium text-slate-800 mb-1">ডকুমেন্ট মেটাডাটা:</p>
                  <p>টোকেন: {job.tokenNumber}</p>
                  <p>পৃষ্ঠা রেঞ্জ: {job.options.pageRange === 'all' ? 'সব পৃষ্ঠা' : job.options.pageRange}</p>
                  <p>বাইন্ডিং / ফিনিশিং: {job.options.binding !== 'none' ? job.options.binding : 'নেই'}</p>
                  {job.notes && <p className="mt-2 text-amber-700 font-medium">কাস্টমার নোট: {job.notes}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {job.notes && (
              <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                নোট: {job.notes}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {job.fileData && (
              <a
                href={job.fileData}
                download={job.fileName}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                ডাউনলোড
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              প্রিন্টারে প্রিন্ট দিন (Print Now)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
