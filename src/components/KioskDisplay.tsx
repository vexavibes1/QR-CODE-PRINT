import { useState, useEffect } from 'react';
import {
  Printer,
  Smartphone,
  UploadCloud,
  FileCheck2,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { QRCodeView } from './QRCodeView.tsx';
import { PrintJob, ShopSettings } from '../types/index.ts';

interface KioskDisplayProps {
  settings: ShopSettings;
  jobs: PrintJob[];
  onOpenCustomerView: () => void;
}

export function KioskDisplay({ settings, jobs, onOpenCustomerView }: KioskDisplayProps) {
  const [customerUrl, setCustomerUrl] = useState('');

  useEffect(() => {
    // Generate URL targeting the mobile customer view
    const origin = window.location.origin;
    const url = `${origin}/?mode=customer`;
    setCustomerUrl(url);
  }, []);

  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const printingJobs = jobs.filter((j) => j.status === 'printing');
  const readyJobs = jobs.filter((j) => j.status === 'completed').slice(0, 3);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Store Header */}
      <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            স্মার্ট সেলফ-সার্ভিস প্রিন্ট কাউন্টার
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {settings.shopName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {settings.tagline} · {settings.shopAddress}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCustomerView}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Smartphone className="w-4 h-4" />
            মোবাইল আপলোড স্ক্রিন টেস্ট করুন
          </button>
        </div>
      </div>

      {/* Main Kiosk Center Area */}
      <div className="max-w-6xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Massive High-Contrast QR Code Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="bg-white text-slate-900 rounded-3xl p-7 shadow-2xl border-4 border-indigo-500/30 flex flex-col items-center max-w-sm w-full text-center relative group">
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Smartphone className="w-4 h-4" />
                ক্যামেরা দিয়ে স্ক্যান করুন
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 uppercase font-mono">
                Instant QR
              </span>
            </div>

            <div className="my-5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <QRCodeView
                value={customerUrl || window.location.href}
                size={230}
                darkColor="#0f172a"
                lightColor="#ffffff"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">
                স্ক্যান করে আপনার ফাইল আপলোড করুন
              </p>
              <p className="text-xs text-slate-500">
                কোনো অ্যাপ ইনস্টল করা লাগবে না। সরাসরি ব্রাউজারে খুলবে।
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-[11px] text-slate-400">
              <span>কাউন্টার আইডি: #C-1</span>
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={onOpenCustomerView}>
                ক্লিক করে খুলুন &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Step Instructions & Live Status Board */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3 Simple Visual Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
                ১
              </div>
              <div>
                <h2 className="text-sm font-bold text-white mb-1">QR স্ক্যান</h2>
                <p className="text-xs text-slate-400">
                  মোবাইল ক্যামেরা দিয়ে কিউআর কোড স্ক্যান করে পেজটি ওপেন করুন।
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                ২
              </div>
              <div>
                <h2 className="text-sm font-bold text-white mb-1">ফাইল ও সেটিংস</h2>
                <p className="text-xs text-slate-400">
                  PDF, ছবি বা ওয়ার্ড ফাইল দিন। রঙিন বা সাদা-কালো এবং কপি সংখ্যা বাছুন।
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                ৩
              </div>
              <div>
                <h2 className="text-sm font-bold text-white mb-1">টোকেন সংগ্রহ</h2>
                <p className="text-xs text-slate-400">
                  সাবমিট করে স্ক্রিনে পাওয়া টোকেন নাম্বার কাউন্টারে জানিয়ে প্রিন্ট নিন।
                </p>
              </div>
            </div>
          </div>

          {/* Current Live Printing Board */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  লাইভ প্রিন্ট কিউ স্ট্যাটাস (Live Board)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                সরাসরি আপডেট হচ্ছে
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Currently Printing */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  এখন প্রিন্ট হচ্ছে:
                </span>
                {printingJobs.length > 0 ? (
                  <div className="space-y-1.5">
                    {printingJobs.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg"
                      >
                        <span className="text-base font-extrabold text-white">{j.tokenNumber}</span>
                        <span className="text-xs text-slate-300 truncate max-w-[140px]">
                          {j.customerName}
                        </span>
                        <span className="text-[11px] text-amber-300 font-medium">প্রিন্ট রানিং</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">বর্তমানে কোনো প্রিন্ট রানিং নেই</p>
                )}
              </div>

              {/* Ready for collection */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  সংগ্রহের জন্য প্রস্তুত (Ready):
                </span>
                {readyJobs.length > 0 ? (
                  <div className="space-y-1.5">
                    {readyJobs.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg"
                      >
                        <span className="text-base font-extrabold text-emerald-400">
                          {j.tokenNumber}
                        </span>
                        <span className="text-xs text-slate-300 truncate max-w-[140px]">
                          {j.customerName}
                        </span>
                        <span className="text-[11px] text-emerald-300 font-medium">কাউন্টারে নিন</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">অপেক্ষা করুন...</p>
                )}
              </div>
            </div>

            {/* Pricing quick ticker on Kiosk */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-4">
                <span>
                  📄 সাদা-কালো: <b className="text-white">{settings.currency} <span className="tabular-nums">{settings.bwRatePerPage}</span></b>
                </span>
                <span>
                  🎨 কালার: <b className="text-white">{settings.currency} <span className="tabular-nums">{settings.colorRatePerPage}</span></b>
                </span>
                <span>
                  ⚡ উভয় পিঠ ছাড়: <b className="text-emerald-400">-{settings.currency} <span className="tabular-nums">{settings.duplexDiscountPerPage}</span></b>
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                বিকাশ/নগদ/ক্যাশ গ্রহণযোগ্য
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>সহায়তার জন্য যোগাযোগ করুন: {settings.shopPhone}</p>
        <p>QuickPrint QR System · সেলফ-সার্ভিস প্রিন্ট কিওস্ক</p>
      </div>
    </div>
  );
}
