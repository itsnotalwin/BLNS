import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtR(n: number | string) {
  return 'R' + Number(n).toLocaleString('en-ZA');
}

export function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return d;
  }
}

export function fmtShortDate(d: string | null | undefined) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });
  } catch (e) {
    return d;
  }
}

export function daysLeft(expiry: string | null | undefined) {
  if (!expiry) return 9999;
  const d = Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return d;
}

export function flagFor(country: string) {
  const m: Record<string, string> = {
    Botswana: '🇧🇼',
    Namibia: '🇳🇦',
    Lesotho: '🇱🇸',
    Eswatini: '🇸🇿',
    Zimbabwe: '🇿🇼',
    Zambia: '🇿🇲'
  };
  return m[country] || '';
}

export function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes('running') || s.includes('delivered') || s.includes('valid') || s.includes('paid') || s.includes('completed') || s.includes('open') || s.includes('active') || s.includes('cleared') || s.includes('on route')) {
    return { bg: 'bg-[rgba(34,197,94,0.12)]', text: 'text-[var(--color-brand-green)]', border: 'border-[rgba(34,197,94,0.2)]' };
  }
  if (s.includes('hold') || s.includes('delayed') || s.includes('breakdown') || s.includes('expired') || s.includes('overdue') || s.includes('backlog') || s.includes('incident') || s.includes('missing')) {
    return { bg: 'bg-[rgba(239,68,68,0.12)]', text: 'text-[var(--color-brand-red)]', border: 'border-[rgba(239,68,68,0.2)]' };
  }
  if (s.includes('transit') || s.includes('service due') || s.includes('expiring') || s.includes('pending') || s.includes('congested') || s.includes('at border') || s.includes('inspection') || s.includes('renewing')) {
    return { bg: 'bg-[rgba(240,165,0,0.12)]', text: 'text-[var(--color-brand-accent)]', border: 'border-[rgba(240,165,0,0.2)]' };
  }
  if (s.includes('loading') || s.includes('scheduled') || s.includes('sent') || s.includes('in progress')) {
    return { bg: 'bg-[rgba(59,130,246,0.12)]', text: 'text-[var(--color-brand-blue)]', border: 'border-[rgba(59,130,246,0.2)]' };
  }
  // Default gray
  return { bg: 'bg-[var(--color-surface-2)]', text: 'text-[var(--color-text-muted)]', border: 'border-[var(--color-border-2)]' };
}
