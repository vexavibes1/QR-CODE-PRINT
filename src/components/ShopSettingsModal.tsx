import { useState } from 'react';
import { X, Save, Check, Store, DollarSign, Phone, Volume2 } from 'lucide-react';
import { ShopSettings } from '../types/index.ts';

interface ShopSettingsModalProps {
  settings: ShopSettings;
  onClose: () => void;
  onSave: (updated: ShopSettings) => Promise<void>;
}

export function ShopSettingsModal({ settings, onClose, onSave }: ShopSettingsModalProps) {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">দোকান ও রেট সেটিংস</h2>
              <p className="text-xs text-slate-500">প্রিন্টিং চার্জ, কাগজের দর ও যোগাযোগের তথ্য পরিবর্তন করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Pricing Rates */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
              পৃষ্ঠাপ্রতি প্রিন্ট রেট (বাংলাদেশি টাকা ৳)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  সাদা-কালো (B&W) রেট / পৃষ্ঠা
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={formData.bwRatePerPage}
                    onChange={(e) =>
                      setFormData({ ...formData, bwRatePerPage: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  কালার (Color) রেট / পৃষ্ঠা
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.colorRatePerPage}
                    onChange={(e) =>
                      setFormData({ ...formData, colorRatePerPage: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  লিগ্যাল (Legal) পেপারের অতিরিক্ত চার্জ / পাতা
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.legalSizeExtra}
                    onChange={(e) =>
                      setFormData({ ...formData, legalSizeExtra: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  উভয় পিঠ (Duplex) প্রিন্ট রিবেট/ছাড় / পাতা
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.duplexDiscountPerPage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duplexDiscountPerPage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  স্পাইরাল বাইন্ডিং খরচ (প্রতি সেট)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    required
                    value={formData.spiralBindingCost}
                    onChange={(e) =>
                      setFormData({ ...formData, spiralBindingCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  লেমিনেশন খরচ (প্রতি পৃষ্ঠা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    required
                    value={formData.laminationCost}
                    onChange={(e) =>
                      setFormData({ ...formData, laminationCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Shop Profile */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-indigo-500" />
              দোকানের পরিচিতি ও ঠিকানা
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">দোকানের নাম</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">মোবাইল নাম্বার</label>
                  <input
                    type="text"
                    required
                    value={formData.shopPhone}
                    onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">স্লোগান / ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">দোকানের ঠিকানা</label>
                <input
                  type="text"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Mobile Payment Accounts */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              মোবাইল ব্যাংকিং (গ্রাহকের পেমেন্টের জন্য)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">বিকাশ (bKash) নাম্বার</label>
                <input
                  type="text"
                  value={formData.bkashNumber}
                  onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="017... (Personal/Merchant)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">নগদ (Nagad) নাম্বার</label>
                <input
                  type="text"
                  value={formData.nagadNumber}
                  onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  placeholder="018... (Personal/Merchant)"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Operational Toggles */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              সিস্টেম নোটিফিকেশন
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSoundAlerts}
                onChange={(e) => setFormData({ ...formData, enableSoundAlerts: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700">
                নতুন ফাইল আপলোড হলে কাউন্টারে বেল / সাউন্ড সাড়াশব্দ করুন (Sound Chime)
              </span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                সংরক্ষণ হয়েছে!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
