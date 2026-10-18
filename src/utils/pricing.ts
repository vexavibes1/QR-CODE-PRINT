import type { CostBreakdown, PricingConfig, PrintOptions } from '../types/index.ts';

/**
 * Parses user input page range like "1-3, 5, 7-9" or "all"
 * and returns the count of selected pages.
 */
export function calculateEffectivePageCount(pageRange: string, totalDetectedPages: number): number {
  const safeTotal = Math.max(1, totalDetectedPages || 1);
  if (!pageRange || pageRange.trim().toLowerCase() === 'all') {
    return safeTotal;
  }

  const parts = pageRange.split(',');
  const selectedPages = new Set<number>();

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
        for (let p = start; p <= Math.min(end, safeTotal); p++) {
          selectedPages.add(p);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= safeTotal) {
        selectedPages.add(pageNum);
      }
    }
  }

  return selectedPages.size > 0 ? selectedPages.size : safeTotal;
}

/**
 * Calculates itemized breakdown and total cost for a print job.
 */
export function calculateJobCost(
  options: PrintOptions,
  pricing: PricingConfig
): CostBreakdown {
  const effectivePages = calculateEffectivePageCount(options.pageRange, options.pageCount);
  const copies = Math.max(1, options.copies || 1);

  // Base rate by color mode
  const pageRate = options.colorMode === 'color' ? pricing.colorRatePerPage : pricing.bwRatePerPage;
  let singleCopyBase = effectivePages * pageRate;

  // Paper size adjustment (e.g. Legal paper add-on per sheet)
  const paperExtraPerSheet = options.paperSize === 'Legal' ? pricing.legalSizeExtra : 0;
  const paperExtra = paperExtraPerSheet * effectivePages * copies;

  // Duplex adjustment (discount per sheet if double-sided)
  let duplexAdjustment = 0;
  if (options.duplex === 'double' && effectivePages >= 2) {
    const sheetsSaved = Math.floor(effectivePages / 2);
    duplexAdjustment = sheetsSaved * pricing.duplexDiscountPerPage * copies;
  }

  const pagesCost = (singleCopyBase * copies);

  // Finishing / Binding
  let bindingCost = 0;
  if (options.binding === 'spiral') {
    bindingCost = pricing.spiralBindingCost * copies;
  } else if (options.binding === 'lamination') {
    // Lamination usually per page or per cover (here per effective page)
    bindingCost = pricing.laminationCost * effectivePages * copies;
  }

  const subTotal = pagesCost + paperExtra - duplexAdjustment + bindingCost;
  const totalCost = Math.max(0, Math.round(subTotal * 100) / 100);

  return {
    effectivePages,
    pageRate,
    pagesCost,
    copies,
    paperExtra,
    duplexAdjustment,
    bindingCost,
    totalCost,
  };
}

export function formatCurrency(amount: number, currency: string = '৳'): string {
  const formatted = amount.toLocaleString('bn-BD', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function generateToken(counter: number): string {
  const num = (counter % 900) + 100;
  return `P-${num}`;
}

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
