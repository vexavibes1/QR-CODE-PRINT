import { useState, useRef, useMemo } from 'react';
import {
  UploadCloud,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Banknote,
} from 'lucide-react';
import {
  PrintJob,
  ShopSettings,
  PrintOptions,
  ColorMode,
  PaperSize,
  DuplexMode,
  BindingOption,
  PaymentMethod,
} from '../types/index.ts';
import { calculateJobCost, formatCurrency } from '../utils/pricing.ts';
import { QRCodeView } from './QRCodeView.tsx';

interface CustomerUploadPortalProps {
  settings: ShopSettings;
  onSubmitJob: (jobData: any) => Promise<PrintJob>;
  onBackToKiosk?: () => void;
}

export function CustomerUploadPortal({
  settings,
  onSubmitJob,
  onBackToKiosk,
}: CustomerUploadPortalProps) {
  // Uploaded file state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    detectedPages: number;
  } | null>(null);

  // Form options state
  const [colorMode, setColorMode] = useState<ColorMode>('bw');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [duplex, setDuplex] = useState<DuplexMode>('single');
  const [copies, setCopies] = useState<number>(1);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('');
  const [binding, setBinding] = useState<BindingOption>('none');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('counter_cash');
  const [notes, setNotes] = useState<string>('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedJob, setSubmittedJob] = useState<PrintJob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Calculate live pricing
  const currentOptions: PrintOptions = useMemo(
    () => ({
      pageCount: selectedFile ? selectedFile.detectedPages : 1,
      copies,
      colorMode,
      paperSize,
      orientation: 'portrait',
      duplex,
      pageRange: pageRangeMode === 'all' ? 'all' : customRange,
      binding,
    }),
    [selectedFile, copies, colorMode, paperSize, duplex, pageRangeMode, customRange, binding]
  );

  const costBreakdown = useMemo(
    () => calculateJobCost(currentOptions, settings),
    [currentOptions, settings]
  );

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Estimate pages: PDF pages can be approximated or defaulted to 1 (user can change)
      let pages = 1;
      if (file.type === 'application/pdf') {
        // Quick estimate by matching /Type /Page in raw data
        const matches = dataUrl.match(/\/Type\s*\/Page\b/g);
        if (matches && matches.length > 0) {
          pages = matches.length;
        }
      }
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        detectedPages: pages,
      });
    };
    reader.onerror = () => {
      setErrorMsg('ফাইলটি পড়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    };
    reader.readAsDataURL(file);
  };

  // Sample files for instant 1-tap testing
  const loadSampleFile = (type: 'admit' | 'nid') => {
    if (type === 'admit') {
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="#fff"><rect width="600" height="800" fill="#ffffff"/><rect x="20" y="20" width="560" height="760" fill="none" stroke="#1e293b" stroke-width="2"/><text x="300" y="70" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#0f172a">Dhaka Education Board</text><text x="300" y="100" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#475569">HSC Examination 2026 - Admit Card</text><line x1="40" y1="120" x2="560" y2="120" stroke="#cbd5e1" stroke-width="1"/><text x="50" y="160" font-family="sans-serif" font-size="14" fill="#1e293b">Roll No: 198421</text><text x="320" y="160" font-family="sans-serif" font-size="14" fill="#1e293b">Reg No: 1812938472</text><text x="50" y="200" font-family="sans-serif" font-size="14" fill="#1e293b">Student Name: Mohammad Tanvir Hasan</text><text x="50" y="240" font-family="sans-serif" font-size="14" fill="#1e293b">College: Dhaka City College</text><rect x="420" y="150" width="130" height="150" fill="#f1f5f9" stroke="#94a3b8"/><text x="485" y="230" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#64748b">Student Photo</text><text x="50" y="320" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">Instructions:</text><text x="50" y="350" font-family="sans-serif" font-size="12" fill="#475569">1. Candidates must bring this original printout to exam hall.</text><text x="50" y="375" font-family="sans-serif" font-size="12" fill="#475569">2. Electronic devices strictly prohibited.</text><line x1="50" y1="700" x2="220" y2="700" stroke="#334155" stroke-width="1"/><text x="135" y="725" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Controller of Examinations</text></svg>`;
      setSelectedFile({
        name: 'HSC_Admit_Card_Sample.pdf',
        size: 195000,
        type: 'application/pdf',
        dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`,
        detectedPages: 1,
      });
    } else {
      const sampleNid = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="#fff"><rect width="600" height="400" fill="#f8fafc"/><rect x="15" y="15" width="570" height="370" rx="12" fill="#ffffff" stroke="#0284c7" stroke-width="3"/><text x="300" y="55" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#0369a1">Government of the People's Republic of Bangladesh</text><text x="300" y="80" font-family="sans-serif" font-size="13" text-anchor="middle" fill="#0f172a">National ID Card / জাতীয় পরিচয়পত্র</text><rect x="40" y="110" width="110" height="130" fill="#e2e8f0" stroke="#94a3b8" rx="6"/><text x="95" y="180" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#64748b">NID Photo</text><text x="180" y="130" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">নাম: ফারহানা আক্তার</text><text x="180" y="160" font-family="sans-serif" font-size="13" fill="#334155">Name: Farhana Akhter</text><text x="40" y="290" font-family="sans-serif" font-size="16" font-weight="bold" fill="#b91c1c">NID NO: 781 920 3411</text></svg>`;
      setSelectedFile({
        name: 'NID_Card_Sample.jpg',
        size: 320000,
        type: 'image/jpeg',
        dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(sampleNid)}`,
        detectedPages: 1,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('অনুগ্রহ করে প্রিন্ট করার জন্য ফাইল সিলেক্ট করুন');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await onSubmitJob({
        customerName: customerName || 'সম্মানিত গ্রাহক',
        customerPhone,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileData: selectedFile.dataUrl,
        options: currentOptions,
        paymentMethod,
        notes,
      });
      setSubmittedJob(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'সাবমিট করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSubmittedJob(null);
    setNotes('');
    setCopies(1);
    setColorMode('bw');
    setCustomRange('');
    setPageRangeMode('all');
  };

  // SUCCESS / TOKEN CONFIRMATION SCREEN
  if (submittedJob) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-6 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold">ফাইল প্রিন্ট কিউতে জমা হয়েছে!</h1>
            <p className="text-xs text-emerald-100 mt-1">
              কাউন্টারে এই টোকেন নাম্বারটি বলুন অথবা স্ক্রিনটি দেখান
            </p>
          </div>

          {/* Token Card */}
          <div className="p-6 text-center space-y-5">
            <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                আপনার প্রিন্ট টোকেন
              </span>
              <div className="text-4xl font-black text-indigo-700 my-2 tracking-tight">
                {submittedJob.tokenNumber}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                পিন কোড: <span className="font-bold font-mono">{submittedJob.pinCode}</span>
              </div>
            </div>

            {/* QR verification for counter operator */}
            <div className="flex flex-col items-center">
              <QRCodeView
                value={`token:${submittedJob.tokenNumber}:${submittedJob.pinCode}`}
                size={120}
              />
              <span className="text-[11px] text-slate-400 mt-1">কাউন্টার স্ক্যান টোকেন</span>
            </div>

            {/* Job Summary */}
            <div className="text-left bg-slate-50 rounded-xl p-4 text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between font-medium text-slate-800">
                <span className="truncate max-w-[200px]">{submittedJob.fileName}</span>
                <span>{submittedJob.options.copies} কপি</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>মোড ও কাগজ:</span>
                <span className="font-medium text-slate-700">
                  {submittedJob.options.colorMode === 'color' ? 'কালার' : 'সাদা-কালো'} ·{' '}
                  {submittedJob.options.paperSize}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                <span>মোট বিল:</span>
                <span className="text-indigo-700 tabular-nums">
                  {formatCurrency(submittedJob.costBreakdown.totalCost, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>পেমেন্ট:</span>
                <span>
                  {submittedJob.paymentMethod === 'counter_cash'
                    ? 'কাউন্টারে ক্যাশ'
                    : submittedJob.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-center gap-3 text-left">
              <div className="w-3 h-3 rounded-full bg-indigo-600 animate-ping shrink-0" />
              <div>
                <p className="font-bold">কাউন্টারে কাজ চলছে...</p>
                <p className="text-[11px] text-indigo-700">
                  অপারেটর প্রিন্টারে ফাইল পাঠালেই প্রিন্ট সম্পন্ন হবে।
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleReset}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                আরেকটি ফাইল প্রিন্ট করুন
              </button>
              {onBackToKiosk && (
                <button
                  onClick={onBackToKiosk}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  &larr; কিওস্ক মেইন স্ক্রিনে ফিরে যান
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UPLOAD & CUSTOMIZE SCREEN
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-4">
          {onBackToKiosk ? (
            <button
              onClick={onBackToKiosk}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              কিওস্ক ডিসপ্লে
            </button>
          ) : (
            <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" />
              সেলফ-সার্ভিস প্রিন্ট
            </span>
          )}
          <span className="text-xs text-slate-500 font-medium">{settings.shopName}</span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Hero Banner */}
          <div className="p-6 pb-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white relative">
            <h1 className="text-xl font-black tracking-tight">আপনার ফাইল আপলোড ও প্রিন্ট</h1>
            <p className="text-xs text-indigo-200 mt-1">
              ডকুমেন্ট বা ছবি দিন, নিজের পছন্দমত সেটিংস বেছে বিল চেক করুন।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: FILE SELECT / CAMERA / DRAG & DROP */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                ১. ফাইল নির্বাচন করুন (PDF, ছবি, ডকুমেন্ট)
              </label>

              {selectedFile ? (
                <div className="p-4 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(0)} KB · সনাক্তকৃত পৃষ্ঠা:{' '}
                        <span className="font-semibold text-indigo-700">{selectedFile.detectedPages}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors shrink-0"
                  >
                    পরিবর্তন
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File drop area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      ফাইল বাছাই করতে এখানে ট্যাপ করুন
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF, JPG, PNG, DOCX (সর্বোচ্চ 25MB)
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Direct Camera & Sample buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-slate-500" />
                      ক্যামেরা দিয়ে ছবি তুলুন
                    </button>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => loadSampleFile('admit')}
                        className="flex-1 py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-semibold transition-colors"
                      >
                        স্যাম্পল এডমিট
                      </button>
                      <button
                        type="button"
                        onClick={() => loadSampleFile('nid')}
                        className="flex-1 py-2 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-[11px] font-semibold transition-colors"
                      >
                        স্যাম্পল NID
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: PRINT CONFIGURATION */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                ২. প্রিন্ট অপশন নির্বাচন করুন
              </label>

              {/* Color Mode Selection */}
              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1.5">প্রিন্টের রঙ:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setColorMode('bw')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      colorMode === 'bw'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">📄 সাদা-কালো (B&W)</p>
                      <p className="text-[11px] text-slate-500">
                        {settings.currency} {settings.bwRatePerPage}/পাতা
                      </p>
                    </div>
                    {colorMode === 'bw' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setColorMode('color')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      colorMode === 'color'
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">🎨 রঙিন (Color)</p>
                      <p className="text-[11px] text-slate-500">
                        {settings.currency} {settings.colorRatePerPage}/পাতা
                      </p>
                    </div>
                    {colorMode === 'color' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
              </div>

              {/* Paper Size & Duplex */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-slate-700 block mb-1.5">কাগজের সাইজ:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperSize('A4')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        paperSize === 'A4'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      A4 সাইজ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('Legal')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        paperSize === 'Legal'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      লিগ্যাল (+{settings.currency}{settings.legalSizeExtra})
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-700 block mb-1.5">প্রিন্ট সাইড:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDuplex('single')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        duplex === 'single'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      এক পিঠ
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplex('double')}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        duplex === 'double'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      উভয় পিঠ (ছাড়)
                    </button>
                  </div>
                </div>
              </div>

              {/* Copies & Page Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <span className="text-xs font-medium text-slate-700 block mb-1.5">কপি সংখ্যা:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-slate-900 tabular-nums">
                      {copies}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCopies(copies + 1)}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-700 block mb-1.5">কোন কোন পৃষ্ঠা:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPageRangeMode('all')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        pageRangeMode === 'all'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      সব পৃষ্ঠা
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageRangeMode('custom')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        pageRangeMode === 'custom'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      নির্দিষ্ট পৃষ্ঠা
                    </button>
                  </div>
                  {pageRangeMode === 'custom' && (
                    <input
                      type="text"
                      placeholder="যেমন: 1-3, 5"
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>

              {/* Extra Finishing / Binding */}
              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1.5">অতিরিক্ত ফিনিশিং (ঐচ্ছিক):</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => setBinding('none')}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                      binding === 'none'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    সাধারণ
                  </button>
                  <button
                    type="button"
                    onClick={() => setBinding('spiral')}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                      binding === 'spiral'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    স্পাইরাল (+৳{settings.spiralBindingCost})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBinding('lamination')}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                      binding === 'lamination'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    লেমিনেশন (+৳{settings.laminationCost})
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 3: CUSTOMER CONTACT & NOTE */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                ৩. আপনার তথ্য ও পেমেন্ট
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="আপনার নাম (ঐচ্ছিক)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="মোবাইল নাম্বার (ঐচ্ছিক)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="অপারেটরের জন্য কোনো বিশেষ নির্দেশ (যেমন: কর্নারে স্টেপলার দিন)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Payment Method Option */}
              <div>
                <span className="text-xs font-medium text-slate-700 block mb-1.5">পেমেন্ট করার মাধ্যম:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('counter_cash')}
                    className={`p-2.5 rounded-xl border text-xs text-center flex flex-col items-center justify-center transition-all ${
                      paymentMethod === 'counter_cash'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mb-1 text-slate-500" />
                    কাউন্টারে ক্যাশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2.5 rounded-xl border text-xs text-center flex flex-col items-center justify-center transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50/70 text-pink-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-pink-600 mb-0.5">bKash</span>
                    বিকাশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-2.5 rounded-xl border text-xs text-center flex flex-col items-center justify-center transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50/70 text-orange-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-orange-600 mb-0.5">নগদ</span>
                    নগদ
                  </button>
                </div>
                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                  <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    দোকানের {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} নাম্বার:{' '}
                    <span className="font-bold text-slate-900 font-mono">
                      {paymentMethod === 'bkash' ? settings.bkashNumber : settings.nagadNumber}
                    </span>{' '}
                    (প্রিন্ট পাওয়ার পর পে করতে পারেন)
                  </p>
                )}
              </div>
            </div>

            {/* STEP 4: LIVE PRICE CALCULATION SUMMARY */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>হিসাব বিবরণী:</span>
                <span>
                  {costBreakdown.effectivePages} পৃষ্ঠা × {costBreakdown.copies} কপি
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>মূল প্রিন্ট বিল:</span>
                <span className="font-medium tabular-nums">{formatCurrency(costBreakdown.pagesCost, settings.currency)}</span>
              </div>
              {costBreakdown.paperExtra > 0 && (
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>লিগ্যাল পেপার অতিরিক্ত:</span>
                  <span className="font-medium tabular-nums">+{formatCurrency(costBreakdown.paperExtra, settings.currency)}</span>
                </div>
              )}
              {costBreakdown.duplexAdjustment > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400">
                  <span>উভয় পিঠ সাশ্রয় ছাড়:</span>
                  <span className="font-medium tabular-nums">-{formatCurrency(costBreakdown.duplexAdjustment, settings.currency)}</span>
                </div>
              )}
              {costBreakdown.bindingCost > 0 && (
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>বাইন্ডিং / লেমিনেশন:</span>
                  <span className="font-medium tabular-nums">+{formatCurrency(costBreakdown.bindingCost, settings.currency)}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-base font-bold text-white">
                <span>মোট বিল:</span>
                <span className="text-xl text-emerald-400 font-black tabular-nums">
                  {formatCurrency(costBreakdown.totalCost, settings.currency)}
                </span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {submitting ? 'ফাইল জমা হচ্ছে...' : 'প্রিন্টের জন্য জমা দিন ও টোকেন নিন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
