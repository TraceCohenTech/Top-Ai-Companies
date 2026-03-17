import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return value.toLocaleString();
}

export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.-]/g, '');
}

export function normalizeCategory(category: string): string {
  return category.trim().replace(/\s+/g, ' ');
}

export function normalizeGeo(geo: string): string {
  const geoMap: Record<string, string> = {
    'usa': 'US',
    'united states': 'US',
    'u.s.': 'US',
    'u.s.a.': 'US',
    'uk': 'UK',
    'united kingdom': 'UK',
    'england': 'UK',
    'germany': 'Germany',
    'france': 'France',
    'canada': 'Canada',
    'israel': 'Israel',
    'china': 'China',
    'japan': 'Japan',
    'india': 'India',
    'south korea': 'South Korea',
    'korea': 'South Korea',
    'singapore': 'Singapore',
    'australia': 'Australia',
    'netherlands': 'Netherlands',
    'norway': 'Norway',
    'czech republic': 'Czech Republic',
    'hong kong': 'Hong Kong',
    'ireland': 'Ireland',
    'poland': 'Poland',
  };
  const normalized = geo.trim().toLowerCase();
  return geoMap[normalized] || geo.trim();
}

export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#84cc16', // lime
  '#6366f1', // indigo
  '#d946ef', // fuchsia
  '#0ea5e9', // sky
  '#22c55e', // green
  '#e11d48', // rose
];

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function calculateCompletenessScore(company: Record<string, unknown>): number {
  const fields = [
    'name', 'category', 'subcategory', 'layer', 'founded_year',
    'description', 'geography', 'website', 'funding_total_usd',
    'last_round_name', 'valuation_usd', 'employee_count', 'company_type'
  ];
  const filled = fields.filter(f => company[f] != null && company[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
}
