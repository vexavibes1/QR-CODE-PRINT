export type ColorMode = 'bw' | 'color';
export type PaperSize = 'A4' | 'Legal' | 'Letter';
export type Orientation = 'portrait' | 'landscape';
export type DuplexMode = 'single' | 'double';
export type BindingOption = 'none' | 'staple' | 'spiral' | 'lamination';
export type JobStatus = 'pending' | 'printing' | 'completed' | 'cancelled';
export type PaymentMethod = 'counter_cash' | 'bkash' | 'nagad' | 'online';
export type PaymentStatus = 'unpaid' | 'paid';

export interface PrintOptions {
  pageCount: number;
  copies: number;
  colorMode: ColorMode;
  paperSize: PaperSize;
  orientation: Orientation;
  duplex: DuplexMode;
  pageRange: string;
  binding: BindingOption;
}

export interface PricingConfig {
  bwRatePerPage: number;
  colorRatePerPage: number;
  legalSizeExtra: number;
  duplexDiscountPerPage: number;
  spiralBindingCost: number;
  laminationCost: number;
  currency: string;
}

export interface CostBreakdown {
  effectivePages: number;
  pageRate: number;
  pagesCost: number;
  copies: number;
  paperExtra: number;
  duplexAdjustment: number;
  bindingCost: number;
  totalCost: number;
}

export interface PrintJob {
  id: string;
  tokenNumber: string;
  pinCode: string;
  customerName: string;
  customerPhone: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData?: string; // base64 or preview URL
  options: PrintOptions;
  costBreakdown: CostBreakdown;
  status: JobStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings extends PricingConfig {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
  tagline: string;
  bkashNumber: string;
  nagadNumber: string;
  autoAccept: boolean;
  enableSoundAlerts: boolean;
}
