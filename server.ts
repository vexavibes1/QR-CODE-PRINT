import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrintJob, ShopSettings } from './src/types/index.ts';
import { calculateJobCost, generatePin, generateToken } from './src/utils/pricing.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store with sensible initial printing business settings
let settings: ShopSettings = {
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

let jobCounter = 101;

// Sample preview SVG/Data to make demo jobs fully printable and previewable
const sampleAdmitSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%23fff"><rect width="600" height="800" fill="%23ffffff"/><rect x="20" y="20" width="560" height="760" fill="none" stroke="%231e293b" stroke-width="2"/><text x="300" y="70" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%230f172a">Dhaka Education Board</text><text x="300" y="100" font-family="sans-serif" font-size="14" text-anchor="middle" fill="%23475569">HSC Examination 2026 - Admit Card</text><line x1="40" y1="120" x2="560" y2="120" stroke="%23cbd5e1" stroke-width="1"/><text x="50" y="160" font-family="sans-serif" font-size="14" fill="%231e293b">Roll No: 198421</text><text x="320" y="160" font-family="sans-serif" font-size="14" fill="%231e293b">Reg No: 1812938472</text><text x="50" y="200" font-family="sans-serif" font-size="14" fill="%231e293b">Student Name: Mohammad Tanvir Hasan</text><text x="50" y="240" font-family="sans-serif" font-size="14" fill="%231e293b">College: Dhaka City College</text><rect x="420" y="150" width="130" height="150" fill="%23f1f5f9" stroke="%2394a3b8"/><text x="485" y="230" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%2364748b">Student Photo</text><text x="50" y="320" font-family="sans-serif" font-size="13" font-weight="bold" fill="%230f172a">Instructions:</text><text x="50" y="350" font-family="sans-serif" font-size="12" fill="%23475569">1. Candidates must bring this original printout to exam hall.</text><text x="50" y="375" font-family="sans-serif" font-size="12" fill="%23475569">2. Electronic devices strictly prohibited.</text><line x1="50" y1="700" x2="220" y2="700" stroke="%23334155" stroke-width="1"/><text x="135" y="725" font-family="sans-serif" font-size="12" text-anchor="middle" fill="%23475569">Controller of Examinations</text></svg>`;

const sampleNidSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23fff"><rect width="600" height="400" fill="%23f8fafc"/><rect x="15" y="15" width="570" height="370" rx="12" fill="%23ffffff" stroke="%230284c7" stroke-width="3"/><text x="300" y="55" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="%230369a1">Government of the People's Republic of Bangladesh</text><text x="300" y="80" font-family="sans-serif" font-size="13" text-anchor="middle" fill="%230f172a">National ID Card / জাতীয় পরিচয়পত্র</text><rect x="40" y="110" width="110" height="130" fill="%23e2e8f0" stroke="%2394a3b8" rx="6"/><text x="95" y="180" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%2364748b">NID Photo</text><text x="180" y="130" font-family="sans-serif" font-size="13" font-weight="bold" fill="%230f172a">নাম: রাহিমা সুলতানা</text><text x="180" y="160" font-family="sans-serif" font-size="13" fill="%23334155">Name: Rahima Sultana</text><text x="180" y="190" font-family="sans-serif" font-size="13" fill="%23334155">পিতা: আব্দুল করিম</text><text x="180" y="220" font-family="sans-serif" font-size="13" fill="%23334155">মাতা: খাদিজা বেগম</text><text x="40" y="290" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23b91c1c">NID NO: 591 829 4810</text><rect x="40" y="320" width="520" height="35" fill="%23e0f2fe" rx="4"/><text x="300" y="342" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%230369a1">উভয় পিঠ পরিষ্কার প্রিন্ট নিশ্চিত করুন</text></svg>`;

let jobs: PrintJob[] = [
  {
    id: 'pj_sample_1',
    tokenNumber: 'P-101',
    pinCode: '4821',
    customerName: 'তানভীর হাসান (Tanvir)',
    customerPhone: '01823-998877',
    fileName: 'HSC_Admit_Card_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 245000,
    fileData: sampleAdmitSvg,
    options: {
      pageCount: 1,
      copies: 2,
      colorMode: 'color',
      paperSize: 'A4',
      orientation: 'portrait',
      duplex: 'single',
      pageRange: 'all',
      binding: 'none',
    },
    costBreakdown: {
      effectivePages: 1,
      pageRate: 15,
      pagesCost: 30,
      copies: 2,
      paperExtra: 0,
      duplexAdjustment: 0,
      bindingCost: 0,
      totalCost: 30,
    },
    status: 'pending',
    paymentMethod: 'counter_cash',
    paymentStatus: 'unpaid',
    notes: 'অরিজিনাল কালার ভালো হতে হবে',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'pj_sample_2',
    tokenNumber: 'P-102',
    pinCode: '8392',
    customerName: 'রাহিমা সুলতানা',
    customerPhone: '01711-223344',
    fileName: 'NID_Card_Front_Back.jpg',
    fileType: 'image/jpeg',
    fileSize: 420000,
    fileData: sampleNidSvg,
    options: {
      pageCount: 1,
      copies: 3,
      colorMode: 'bw',
      paperSize: 'A4',
      orientation: 'landscape',
      duplex: 'single',
      pageRange: 'all',
      binding: 'lamination',
    },
    costBreakdown: {
      effectivePages: 1,
      pageRate: 3,
      pagesCost: 9,
      copies: 3,
      paperExtra: 0,
      duplexAdjustment: 0,
      bindingCost: 60, // 3 x 20
      totalCost: 69,
    },
    status: 'printing',
    paymentMethod: 'bkash',
    paymentStatus: 'paid',
    notes: 'লেমিনেশন সহ ৩ কপি লাগবে',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'pj_sample_3',
    tokenNumber: 'P-100',
    pinCode: '1192',
    customerName: 'সাকিব আল হাসান',
    customerPhone: '01999-887766',
    fileName: 'Project_Proposal_Draft.pdf',
    fileType: 'application/pdf',
    fileSize: 1820000,
    fileData: sampleAdmitSvg,
    options: {
      pageCount: 12,
      copies: 1,
      colorMode: 'bw',
      paperSize: 'A4',
      orientation: 'portrait',
      duplex: 'double',
      pageRange: 'all',
      binding: 'spiral',
    },
    costBreakdown: {
      effectivePages: 12,
      pageRate: 3,
      pagesCost: 36,
      copies: 1,
      paperExtra: 0,
      duplexAdjustment: 3,
      bindingCost: 35,
      totalCost: 68,
    },
    status: 'completed',
    paymentMethod: 'counter_cash',
    paymentStatus: 'paid',
    notes: 'স্পাইরাল বাইন্ডিং সম্পন্ন',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

// Connected SSE clients for instant live push
const sseClients: Response[] = [];

function broadcastUpdate(type: 'JOB_CREATED' | 'JOB_UPDATED' | 'JOB_DELETED' | 'SETTINGS_UPDATED', payload: any) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for JSON/url-encoded with large payload support for files
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // SSE stream endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    // Initial ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Active' })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // API Routes
  app.get('/api/jobs', (_req: Request, res: Response) => {
    res.json({ success: true, jobs });
  });

  app.get('/api/jobs/:id', (req: Request, res: Response) => {
    const job = jobs.find((j) => j.id === req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.json({ success: true, job });
  });

  app.post('/api/jobs', (req: Request, res: Response) => {
    try {
      const {
        customerName,
        customerPhone,
        fileName,
        fileType,
        fileSize,
        fileData,
        options,
        paymentMethod = 'counter_cash',
        notes = '',
      } = req.body;

      if (!fileName) {
        return res.status(400).json({ success: false, error: 'File is required' });
      }

      jobCounter += 1;
      const tokenNumber = generateToken(jobCounter);
      const pinCode = generatePin();
      const costBreakdown = calculateJobCost(options, settings);

      const newJob: PrintJob = {
        id: `pj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tokenNumber,
        pinCode,
        customerName: (customerName || 'সম্মানিত গ্রাহক').trim(),
        customerPhone: (customerPhone || '').trim(),
        fileName,
        fileType: fileType || 'application/octet-stream',
        fileSize: Number(fileSize) || 0,
        fileData: fileData || '',
        options,
        costBreakdown,
        status: settings.autoAccept ? 'pending' : 'pending',
        paymentMethod,
        paymentStatus: 'unpaid',
        notes: (notes || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jobs.unshift(newJob);
      broadcastUpdate('JOB_CREATED', newJob);

      res.status(201).json({ success: true, job: newJob });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  app.patch('/api/jobs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const { status, paymentStatus, paymentMethod, notes } = req.body;
    const current = jobs[index];

    const updatedJob: PrintJob = {
      ...current,
      status: status !== undefined ? status : current.status,
      paymentStatus: paymentStatus !== undefined ? paymentStatus : current.paymentStatus,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : current.paymentMethod,
      notes: notes !== undefined ? notes : current.notes,
      updatedAt: new Date().toISOString(),
    };

    jobs[index] = updatedJob;
    broadcastUpdate('JOB_UPDATED', updatedJob);

    res.json({ success: true, job: updatedJob });
  });

  app.delete('/api/jobs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const deleted = jobs.splice(index, 1)[0];
    broadcastUpdate('JOB_DELETED', { id: deleted.id });

    res.json({ success: true, deletedId: deleted.id });
  });

  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json({ success: true, settings });
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    try {
      settings = {
        ...settings,
        ...req.body,
      };
      broadcastUpdate('SETTINGS_UPDATED', settings);
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.get('/api/stats', (_req: Request, res: Response) => {
    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter((j) => j.status === 'pending').length;
    const printingJobs = jobs.filter((j) => j.status === 'printing').length;
    const completedJobs = jobs.filter((j) => j.status === 'completed').length;
    const totalRevenue = jobs
      .filter((j) => j.paymentStatus === 'paid')
      .reduce((sum, j) => sum + j.costBreakdown.totalCost, 0);

    res.json({
      success: true,
      stats: {
        totalJobs,
        pendingJobs,
        printingJobs,
        completedJobs,
        totalRevenue,
      },
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Print QR Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
