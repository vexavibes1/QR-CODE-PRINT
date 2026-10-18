import { PrintJob, ShopSettings } from '../types/index.ts';

const API_BASE = '/api';

export async function fetchJobs(): Promise<PrintJob[]> {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function createJob(jobData: Partial<PrintJob>): Promise<PrintJob> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit print job');
  }
  const data = await res.json();
  return data.job;
}

export async function updateJobStatus(
  id: string,
  updates: Partial<PrintJob>
): Promise<PrintJob> {
  const res = await fetch(`${API_BASE}/jobs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update job');
  const data = await res.json();
  return data.job;
}

export async function deleteJob(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/jobs/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function fetchSettings(): Promise<ShopSettings | null> {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    const data = await res.json();
    return data.settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
}

export async function updateSettings(settings: Partial<ShopSettings>): Promise<ShopSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  const data = await res.json();
  return data.settings;
}
