import { useState, useEffect, useCallback } from 'react';
import { PrintJob, ShopSettings } from './types/index.ts';
import {
  fetchJobs,
  fetchSettings,
  createJob,
  updateJobStatus,
  deleteJob,
  updateSettings,
} from './utils/api.ts';
import { playChime } from './utils/audio.ts';
import { Header } from './components/Header.tsx';
import { OperatorDashboard } from './components/OperatorDashboard.tsx';
import { KioskDisplay } from './components/KioskDisplay.tsx';
import { CustomerUploadPortal } from './components/CustomerUploadPortal.tsx';
import { DocumentPrintPreviewModal } from './components/DocumentPrintPreviewModal.tsx';
import { PrintReceiptModal } from './components/PrintReceiptModal.tsx';
import { ShopSettingsModal } from './components/ShopSettingsModal.tsx';

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'সততা ডিজিটাল প্রিন্ট ও ফটোকপি',
  shopPhone: '01712-345678',
  shopAddress: 'দোকান নং ১২, সুপার মার্কেট, ঢাকা',
  tagline: 'সহজ ও দ্রুত কিউআর সেলফ-সার্ভিস প্রিন্ট কাউন্টার',
  bwRatePerPage: 3,
  colorRatePerPage: 15,
  legalSizeExtra: 1,
  duplexDiscountPerPage: 0.5,
  spiralBindingCost: 35,
  laminationCost: 20,
  currency: '৳',
  bkashNumber: '01712-345678 (Personal / Send Money)',
  nagadNumber: '01812-345678 (Personal)',
  autoAccept: true,
  enableSoundAlerts: true,
};

export default function App() {
  const [currentView, setCurrentView] = useState<'operator' | 'kiosk' | 'customer'>('operator');
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);
  const [receiptJob, setReceiptJob] = useState<PrintJob | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Check URL query parameters for view on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'customer') {
      setCurrentView('customer');
    } else if (mode === 'kiosk') {
      setCurrentView('kiosk');
    }
  }, []);

  // Fetch initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [fetchedJobs, fetchedSettings] = await Promise.all([
        fetchJobs(),
        fetchSettings(),
      ]);
      if (fetchedJobs && fetchedJobs.length > 0) {
        setJobs(fetchedJobs);
      }
      if (fetchedSettings) {
        setSettings(fetchedSettings);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Real-time EventSource SSE subscription
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'JOB_CREATED') {
            const newJob = parsed.payload as PrintJob;
            setJobs((prev) => {
              if (prev.some((j) => j.id === newJob.id)) return prev;
              return [newJob, ...prev];
            });
            if (settings.enableSoundAlerts) {
              playChime();
            }
          } else if (parsed.type === 'JOB_UPDATED') {
            const updated = parsed.payload as PrintJob;
            setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
          } else if (parsed.type === 'JOB_DELETED') {
            const { id } = parsed.payload;
            setJobs((prev) => prev.filter((j) => j.id !== id));
          } else if (parsed.type === 'SETTINGS_UPDATED') {
            setSettings(parsed.payload);
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };
    } catch (err) {
      console.error('SSE connection error:', err);
    }

    // Secondary backup poll every 5 seconds
    const interval = setInterval(() => {
      fetchJobs().then((data) => {
        if (data && data.length > 0) {
          setJobs(data);
        }
      });
    }, 5000);

    return () => {
      eventSource?.close();
      clearInterval(interval);
    };
  }, [settings.enableSoundAlerts]);

  // Handlers
  const handleCreateJob = async (jobData: any): Promise<PrintJob> => {
    const job = await createJob(jobData);
    setJobs((prev) => {
      if (prev.some((j) => j.id === job.id)) return prev;
      return [job, ...prev];
    });
    return job;
  };

  const handleUpdateJob = async (id: string, updates: Partial<PrintJob>) => {
    // Optimistic update
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    try {
      const updated = await updateJobStatus(id, updates);
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    } catch (err) {
      console.error('Failed to update job:', err);
      loadInitialData();
    }
  };

  const handleDeleteJob = async (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      await deleteJob(id);
    } catch (err) {
      console.error('Failed to delete job:', err);
      loadInitialData();
    }
  };

  const handleSaveSettings = async (newSettings: ShopSettings) => {
    setSettings(newSettings);
    try {
      const saved = await updateSettings(newSettings);
      setSettings(saved);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // If customer upload portal is active
  if (currentView === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50">
        <CustomerUploadPortal
          settings={settings}
          onSubmitJob={handleCreateJob}
          onBackToKiosk={() => setCurrentView('kiosk')}
        />
      </div>
    );
  }

  // If Kiosk mode is active
  if (currentView === 'kiosk') {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Subtle quick return nav for operator */}
        <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>🖥️ কিওস্ক ফুলস্ক্রিন ডিসপ্লে ভিউ (গ্রাহকমুখী ডিসপ্লে)</span>
          <button
            onClick={() => setCurrentView('operator')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md transition-colors"
          >
            &larr; কাউন্টার ড্যাশবোর্ডে ফিরুন
          </button>
        </div>
        <KioskDisplay
          settings={settings}
          jobs={jobs}
          onOpenCustomerView={() => setCurrentView('customer')}
        />
      </div>
    );
  }

  // Default: Operator Console View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSettings={() => setShowSettings(true)}
        settings={settings}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Banner with shop address & quick mode toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">{settings.shopName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings.shopAddress} · হেল্পলাইন: {settings.shopPhone}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('kiosk')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>🖥️ কিওস্ক ডিসপ্লে চালু করুন</span>
            </button>
            <button
              onClick={() => setCurrentView('customer')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>📱 কিউআর আপলোড টেস্ট</span>
            </button>
          </div>
        </div>

        {/* Dashboard Main Content */}
        <OperatorDashboard
          jobs={jobs}
          settings={settings}
          onUpdateJob={handleUpdateJob}
          onDeleteJob={handleDeleteJob}
          onPreviewJob={(job) => setPreviewJob(job)}
          onPrintReceipt={(job) => setReceiptJob(job)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenKiosk={() => setCurrentView('kiosk')}
          onOpenCustomerView={() => setCurrentView('customer')}
        />
      </main>

      {/* Modals */}
      {previewJob && (
        <DocumentPrintPreviewModal
          job={previewJob}
          settings={settings}
          onClose={() => setPreviewJob(null)}
          onMarkPrinted={(id) => handleUpdateJob(id, { status: 'printing' })}
        />
      )}

      {receiptJob && (
        <PrintReceiptModal
          job={receiptJob}
          settings={settings}
          onClose={() => setReceiptJob(null)}
        />
      )}

      {showSettings && (
        <ShopSettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
