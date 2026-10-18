import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEffectivePageCount, calculateJobCost } from './pricing.ts';
import type { PricingConfig, PrintOptions } from '../types/index.ts';

const mockPricing: PricingConfig = {
  bwRatePerPage: 3,
  colorRatePerPage: 15,
  legalSizeExtra: 1,
  duplexDiscountPerPage: 0.5,
  spiralBindingCost: 30,
  laminationCost: 20,
  currency: '৳',
};

test('calculateEffectivePageCount returns full count when range is "all"', () => {
  const result = calculateEffectivePageCount('all', 12);
  assert.equal(result, 12);
});

test('calculateEffectivePageCount correctly parses ranges like "1-3, 5, 7-8"', () => {
  // Pages 1, 2, 3, 5, 7, 8 -> 6 pages
  const result = calculateEffectivePageCount('1-3, 5, 7-8', 10);
  assert.equal(result, 6);
});

test('calculateEffectivePageCount ignores out-of-bounds page numbers', () => {
  const result = calculateEffectivePageCount('1-2, 20', 5);
  // 1, 2 within 5. 20 is ignored.
  assert.equal(result, 2);
});

test('calculateJobCost calculates standard B&W 1-sided print job', () => {
  const options: PrintOptions = {
    pageCount: 10,
    copies: 2,
    colorMode: 'bw',
    paperSize: 'A4',
    orientation: 'portrait',
    duplex: 'single',
    pageRange: 'all',
    binding: 'none',
  };

  const cost = calculateJobCost(options, mockPricing);
  // 10 pages * ৳3 = ৳30 per copy * 2 copies = ৳60
  assert.equal(cost.effectivePages, 10);
  assert.equal(cost.pageRate, 3);
  assert.equal(cost.pagesCost, 60);
  assert.equal(cost.totalCost, 60);
});

test('calculateJobCost applies color pricing and duplex discount', () => {
  const options: PrintOptions = {
    pageCount: 4,
    copies: 1,
    colorMode: 'color',
    paperSize: 'A4',
    orientation: 'portrait',
    duplex: 'double',
    pageRange: 'all',
    binding: 'none',
  };

  const cost = calculateJobCost(options, mockPricing);
  // 4 pages * ৳15 = ৳60
  // Duplex savings: 4 pages = 2 sheets saved -> 2 * 0.5 = ৳1 discount
  // Total = 60 - 1 = ৳59
  assert.equal(cost.pagesCost, 60);
  assert.equal(cost.duplexAdjustment, 1);
  assert.equal(cost.totalCost, 59);
});

test('calculateJobCost adds spiral binding cost properly', () => {
  const options: PrintOptions = {
    pageCount: 5,
    copies: 2,
    colorMode: 'bw',
    paperSize: 'A4',
    orientation: 'portrait',
    duplex: 'single',
    pageRange: 'all',
    binding: 'spiral',
  };

  const cost = calculateJobCost(options, mockPricing);
  // 5 * 3 * 2 = ৳30 + (30 * 2) = ৳90
  assert.equal(cost.bindingCost, 60);
  assert.equal(cost.totalCost, 90);
});
