export interface Company {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  layer: string;
  founded_year: number | null;
  description: string | null;
  geography: string;
  notes: string | null;
  website: string | null;
  funding_total_usd: number | null;
  last_round_name: string | null;
  last_round_usd: number | null;
  last_round_date: string | null;
  valuation_usd: number | null;
  investor_summary: string | null;
  company_type: 'private' | 'public' | 'acquired' | 'unknown';
  ticker: string | null;
  employee_count: number | null;
  revenue_estimate: number | null;
  thesis_fit_score: number | null;
  overcrowded_score: number | null;
  strategic_importance_score: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CompanyFilters {
  search?: string;
  categories?: string[];
  subcategories?: string[];
  layers?: string[];
  geographies?: string[];
  yearRange?: [number, number];
  companyType?: string[];
  fundingRange?: [number, number];
  thesisFitMin?: number;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DashboardStats {
  totalCompanies: number;
  totalCategories: number;
  totalLayers: number;
  totalGeographies: number;
  avgFoundedYear: number;
  totalFundingTracked: number;
}

export interface CategoryCount {
  name: string;
  count: number;
  fill?: string;
}

export interface LayerCount {
  name: string;
  count: number;
}

export interface GeoCount {
  name: string;
  count: number;
}

export interface YearTrend {
  year: number;
  count: number;
}

export interface MatrixCell {
  category: string;
  layer: string;
  count: number;
}

export interface ThesisPreset {
  id: string;
  name: string;
  description: string;
  weights: Record<string, number>;
  geoPreference?: string[];
  layerPreference?: string[];
  minScore?: number;
}

export interface Insight {
  text: string;
  type: 'crowding' | 'trend' | 'geographic' | 'strategic' | 'funding';
  severity: 'info' | 'warning' | 'highlight';
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface CSVRow {
  Company: string;
  Category: string;
  Subcategory?: string;
  Layer: string;
  Geo: string;
  'Year Founded'?: string;
  Description?: string;
  Notes?: string;
  [key: string]: string | undefined;
}
