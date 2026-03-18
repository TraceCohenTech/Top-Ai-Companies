import { Company, CompanyFilters, DashboardStats, CategoryCount, LayerCount, GeoCount, YearTrend, MatrixCell, Insight } from '@/types';
import Papa from 'papaparse';
import { slugify, normalizeCompanyName, normalizeCategory, normalizeGeo, getChartColor } from './utils';
import fs from 'fs';
import path from 'path';

let cachedCompanies: Company[] | null = null;

function enrichWithScores(companies: Company[]): Company[] {
  const categoryCounts: Record<string, number> = {};
  companies.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const maxCategoryCount = Math.max(...Object.values(categoryCounts));

  const strategicLayers: Record<string, number> = {
    'Foundation': 10,
    'Hardware': 9,
    'Cloud': 8,
    'Platform': 7,
    'Middleware': 6,
    'DevTools': 5,
    'Application': 4,
  };

  const thesisCategories: Record<string, number> = {
    'Robotics': 9,
    'Vertical AI': 8,
    'Cybersecurity AI': 8,
    'Infrastructure': 7,
    'Frontier Models': 7,
    'Agent Frameworks': 6,
    'Data & MLOps': 5,
    'Enterprise AI': 5,
    'Developer Tools': 4,
    'Automation': 4,
    'AI Applications': 3,
  };

  return companies.map(c => {
    const categoryDensity = categoryCounts[c.category] || 0;
    const overcrowded_score = Math.round((categoryDensity / maxCategoryCount) * 10);

    const layerScore = strategicLayers[c.layer] || 5;
    const uniqueness = Math.max(1, 10 - overcrowded_score);
    const maturity = c.founded_year ? Math.min(10, Math.max(1, 2026 - c.founded_year)) : 5;
    const strategic_importance_score = Math.round((layerScore * 0.4 + uniqueness * 0.3 + maturity * 0.3));

    const thesis_fit_score = thesisCategories[c.category] || 3;

    return {
      ...c,
      overcrowded_score,
      strategic_importance_score,
      thesis_fit_score,
    };
  });
}

function parseUSD(val: string | undefined): number | null {
  if (!val || val.trim() === '') return null;
  const num = parseInt(val.replace(/[^0-9]/g, ''));
  return isNaN(num) ? null : num;
}

export function loadCompanies(): Company[] {
  if (cachedCompanies) return cachedCompanies;

  const csvPath = path.join(process.cwd(), 'data', 'ai-landscape.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const { data } = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  const companies: Company[] = (data as Record<string, string>[]).map((row, i) => {
    const name = normalizeCompanyName(row['Company'] || '');
    const category = normalizeCategory(row['Category'] || 'Uncategorized');
    const companyType = (row['Company Type']?.trim()?.toLowerCase() || 'private') as 'private' | 'public' | 'acquired' | 'unknown';

    return {
      id: String(i + 1),
      slug: slugify(name),
      name,
      category,
      subcategory: row['Subcategory']?.trim() || null,
      layer: row['Layer']?.trim() || 'Unknown',
      founded_year: row['Year Founded'] ? parseInt(row['Year Founded']) : null,
      description: row['Description']?.trim() || null,
      geography: normalizeGeo(row['Geo'] || 'Unknown'),
      notes: row['Notes']?.trim() || null,
      website: row['Website']?.trim() || null,
      funding_total_usd: parseUSD(row['Funding Total USD']),
      last_round_name: row['Last Round']?.trim() || null,
      last_round_usd: parseUSD(row['Last Round USD']),
      last_round_date: row['Last Round Date']?.trim() || null,
      valuation_usd: parseUSD(row['Valuation USD']),
      investor_summary: row['Investors']?.trim() || null,
      company_type: companyType,
      ticker: row['Ticker']?.trim() || null,
      employee_count: row['Employee Count'] ? parseInt(row['Employee Count']) : null,
      revenue_estimate: parseUSD(row['Revenue Estimate USD']),
      thesis_fit_score: null,
      overcrowded_score: null,
      strategic_importance_score: null,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Company;
  });

  cachedCompanies = enrichWithScores(companies);
  return cachedCompanies;
}

export function getFilteredCompanies(filters: CompanyFilters): Company[] {
  let companies = loadCompanies();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    companies = companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.subcategory?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q)
    );
  }

  if (filters.categories?.length) {
    companies = companies.filter(c => filters.categories!.includes(c.category));
  }
  if (filters.subcategories?.length) {
    companies = companies.filter(c => c.subcategory && filters.subcategories!.includes(c.subcategory));
  }
  if (filters.layers?.length) {
    companies = companies.filter(c => filters.layers!.includes(c.layer));
  }
  if (filters.geographies?.length) {
    companies = companies.filter(c => filters.geographies!.includes(c.geography));
  }
  if (filters.yearRange) {
    companies = companies.filter(c =>
      c.founded_year != null &&
      c.founded_year >= filters.yearRange![0] &&
      c.founded_year <= filters.yearRange![1]
    );
  }
  if (filters.companyType?.length) {
    companies = companies.filter(c => filters.companyType!.includes(c.company_type));
  }
  if (filters.thesisFitMin != null) {
    companies = companies.filter(c =>
      c.thesis_fit_score != null && c.thesis_fit_score >= filters.thesisFitMin!
    );
  }

  const sortBy = filters.sortBy || 'name';
  const sortOrder = filters.sortOrder || 'asc';
  companies.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'string'
      ? aVal.localeCompare(bVal as string)
      : (aVal as number) - (bVal as number);
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  return companies;
}

export function getDashboardStats(): DashboardStats {
  const companies = loadCompanies();
  const categories = new Set(companies.map(c => c.category));
  const layers = new Set(companies.map(c => c.layer));
  const geos = new Set(companies.map(c => c.geography));
  const years = companies.filter(c => c.founded_year).map(c => c.founded_year!);
  const avgYear = years.length ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : 0;
  const totalFunding = companies.reduce((sum, c) => sum + (c.funding_total_usd || 0), 0);

  return {
    totalCompanies: companies.length,
    totalCategories: categories.size,
    totalLayers: layers.size,
    totalGeographies: geos.size,
    avgFoundedYear: avgYear,
    totalFundingTracked: totalFunding,
  };
}

export function getCategoryCounts(): CategoryCount[] {
  const companies = loadCompanies();
  const counts: Record<string, number> = {};
  companies.forEach(c => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count], i) => ({ name, count, fill: getChartColor(i) }))
    .sort((a, b) => b.count - a.count);
}

export function getLayerCounts(): LayerCount[] {
  const companies = loadCompanies();
  const counts: Record<string, number> = {};
  companies.forEach(c => {
    counts[c.layer] = (counts[c.layer] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getGeoCounts(): GeoCount[] {
  const companies = loadCompanies();
  const counts: Record<string, number> = {};
  companies.forEach(c => {
    counts[c.geography] = (counts[c.geography] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getYearTrends(): YearTrend[] {
  const companies = loadCompanies();
  const counts: Record<number, number> = {};
  companies.forEach(c => {
    if (c.founded_year) {
      counts[c.founded_year] = (counts[c.founded_year] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
}

export function getCategoryLayerMatrix(): MatrixCell[] {
  const companies = loadCompanies();
  const matrix: Record<string, Record<string, number>> = {};
  companies.forEach(c => {
    if (!matrix[c.category]) matrix[c.category] = {};
    matrix[c.category][c.layer] = (matrix[c.category][c.layer] || 0) + 1;
  });
  const cells: MatrixCell[] = [];
  Object.entries(matrix).forEach(([category, layers]) => {
    Object.entries(layers).forEach(([layer, count]) => {
      cells.push({ category, layer, count });
    });
  });
  return cells;
}

export function getFundingByCategory(): CategoryCount[] {
  const companies = loadCompanies();
  const sums: Record<string, number> = {};
  companies.forEach(c => {
    if (c.funding_total_usd) {
      sums[c.category] = (sums[c.category] || 0) + c.funding_total_usd;
    }
  });
  return Object.entries(sums)
    .map(([name, count], i) => ({ name, count, fill: getChartColor(i) }))
    .sort((a, b) => b.count - a.count);
}

export function generateInsights(companies?: Company[]): Insight[] {
  const data = companies || loadCompanies();
  const insights: Insight[] = [];

  // Most crowded category
  const catCounts: Record<string, number> = {};
  data.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    insights.push({
      text: `${sortedCats[0][0]} is the most crowded category with ${sortedCats[0][1]} companies`,
      type: 'crowding',
      severity: 'highlight',
    });
  }

  // Least crowded
  if (sortedCats.length > 1) {
    const least = sortedCats[sortedCats.length - 1];
    insights.push({
      text: `${least[0]} has the fewest companies (${least[1]}), suggesting potential white space`,
      type: 'crowding',
      severity: 'info',
    });
  }

  // Geographic dominance
  const geoCounts: Record<string, number> = {};
  data.forEach(c => { geoCounts[c.geography] = (geoCounts[c.geography] || 0) + 1; });
  const topGeo = Object.entries(geoCounts).sort((a, b) => b[1] - a[1])[0];
  if (topGeo) {
    const pct = Math.round((topGeo[1] / data.length) * 100);
    insights.push({
      text: `${topGeo[0]}-based companies represent ${pct}% of the tracked landscape`,
      type: 'geographic',
      severity: pct > 70 ? 'warning' : 'info',
    });
  }

  // Founding year trends
  const recentCompanies = data.filter(c => c.founded_year && c.founded_year >= 2022);
  const olderCompanies = data.filter(c => c.founded_year && c.founded_year < 2015);
  if (recentCompanies.length > 0) {
    insights.push({
      text: `${recentCompanies.length} companies founded since 2022, showing rapid ecosystem expansion`,
      type: 'trend',
      severity: 'highlight',
    });
  }

  // Layer analysis
  const layerCounts: Record<string, number> = {};
  data.forEach(c => { layerCounts[c.layer] = (layerCounts[c.layer] || 0) + 1; });
  const appCount = layerCounts['Application'] || 0;
  const infraCount = (layerCounts['Hardware'] || 0) + (layerCounts['Cloud'] || 0) + (layerCounts['Foundation'] || 0);
  if (appCount > infraCount) {
    insights.push({
      text: `Application layer (${appCount}) outnumbers infrastructure (${infraCount}), typical of maturing markets`,
      type: 'strategic',
      severity: 'info',
    });
  }

  // Funding concentration
  const fundingByCat: Record<string, number> = {};
  data.forEach(c => {
    if (c.funding_total_usd) {
      fundingByCat[c.category] = (fundingByCat[c.category] || 0) + c.funding_total_usd;
    }
  });
  const topFunded = Object.entries(fundingByCat).sort((a, b) => b[1] - a[1])[0];
  if (topFunded) {
    insights.push({
      text: `${topFunded[0]} leads in total tracked funding concentration`,
      type: 'funding',
      severity: 'highlight',
    });
  }

  return insights;
}

export function getCompanyBySlug(slug: string): Company | undefined {
  return loadCompanies().find(c => c.slug === slug);
}

export function getRelatedCompanies(company: Company, limit = 5): Company[] {
  return loadCompanies()
    .filter(c => c.id !== company.id && (c.category === company.category || c.layer === company.layer))
    .slice(0, limit);
}

export function getUniqueValues(field: keyof Company): string[] {
  const companies = loadCompanies();
  const values = new Set<string>();
  companies.forEach(c => {
    const val = c[field];
    if (val != null && val !== '') values.add(String(val));
  });
  return Array.from(values).sort();
}

export function getTopFundedCompanies(limit = 15): Company[] {
  return loadCompanies()
    .filter(c => c.funding_total_usd && c.funding_total_usd > 0)
    .sort((a, b) => (b.funding_total_usd || 0) - (a.funding_total_usd || 0))
    .slice(0, limit);
}

export function getTopValuedCompanies(limit = 15): Company[] {
  return loadCompanies()
    .filter(c => c.valuation_usd && c.valuation_usd > 0)
    .sort((a, b) => (b.valuation_usd || 0) - (a.valuation_usd || 0))
    .slice(0, limit);
}

export function getCompanyEras(): { era: string; range: string; count: number; companies: Company[] }[] {
  const companies = loadCompanies();
  const eras = [
    { era: 'Pioneers', range: 'Pre-2010', min: 0, max: 2009 },
    { era: 'Foundation Era', range: '2010–2015', min: 2010, max: 2015 },
    { era: 'ML Infrastructure', range: '2016–2019', min: 2016, max: 2019 },
    { era: 'Pre-GPT Wave', range: '2020–2021', min: 2020, max: 2021 },
    { era: 'GenAI Explosion', range: '2022–2023', min: 2022, max: 2023 },
    { era: 'Post-GPT4 Era', range: '2024+', min: 2024, max: 2099 },
  ];
  return eras.map(e => {
    const matched = companies.filter(c => c.founded_year && c.founded_year >= e.min && c.founded_year <= e.max);
    return { era: e.era, range: e.range, count: matched.length, companies: matched };
  });
}

export function getCategoryFundingStats(): { category: string; totalFunding: number; avgFunding: number; count: number; topCompany: string }[] {
  const companies = loadCompanies();
  const cats: Record<string, { total: number; count: number; top: string; topVal: number }> = {};
  companies.forEach(c => {
    if (!cats[c.category]) cats[c.category] = { total: 0, count: 0, top: '', topVal: 0 };
    cats[c.category].count++;
    if (c.funding_total_usd) {
      cats[c.category].total += c.funding_total_usd;
      if (c.funding_total_usd > cats[c.category].topVal) {
        cats[c.category].topVal = c.funding_total_usd;
        cats[c.category].top = c.name;
      }
    }
  });
  return Object.entries(cats)
    .map(([category, d]) => ({
      category,
      totalFunding: d.total,
      avgFunding: d.count > 0 ? Math.round(d.total / d.count) : 0,
      count: d.count,
      topCompany: d.top,
    }))
    .sort((a, b) => b.totalFunding - a.totalFunding);
}

export function getSubcategoryCounts(): { category: string; subcategory: string; count: number }[] {
  const companies = loadCompanies();
  const counts: Record<string, number> = {};
  companies.forEach(c => {
    if (c.subcategory) {
      const key = `${c.category}|||${c.subcategory}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([key, count]) => {
      const [category, subcategory] = key.split('|||');
      return { category, subcategory, count };
    })
    .sort((a, b) => b.count - a.count);
}
