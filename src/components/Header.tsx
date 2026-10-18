import { Printer, Tv, Smartphone, Settings, Plus } from 'lucide-react';
import { ShopSettings } from '../types/index.ts';

interface HeaderProps {
  currentView: 'operator' | 'kiosk' | 'customer';
  onNavigate: (view: 'operator' | 'kiosk' | 'customer') => void;
  onOpenSettings: () => void;
  settings: ShopSettings;
}

export function Header({ currentView, onNavigate, onOpenSettings, settings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => onNavigate('operator')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
              QuickPrint QR
            </span>
            <span className="text-[10px] text-slate-500 font-medium block leading-none">
              সেলফ-সার্ভিস প্রিন্ট সিস্টেম
            </span>
          </div>
        </div>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('operator')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 py-1 border-b-2 ${
              currentView === 'operator'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent'
            }`}
          >
            কাউন্টার কিউ
          </button>
          <button
            onClick={() => onNavigate('kiosk')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 py-1 border-b-2 ${
              currentView === 'kiosk'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent'
            }`}
          >
            কিওস্ক ডিসপ্লে
          </button>
          <button
            onClick={() => onNavigate('customer')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 py-1 border-b-2 ${
              currentView === 'customer'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent'
            }`}
          >
            কাস্টমার আপলোড
          </button>
          <button
            onClick={onOpenSettings}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 py-1 border-b-2 border-transparent text-slate-600"
          >
            রেট সেটিংস
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('customer')}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            নতুন প্রিন্ট টেস্ট
          </button>
        </div>
      </div>
    </header>
  );
}
