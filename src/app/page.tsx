import {
  loadCompanies, getDashboardStats, getCategoryCounts, getLayerCounts,
  getGeoCounts, getYearTrends, getFundingByCategory, getCategoryLayerMatrix,
  generateInsights, getTopFundedCompanies, getTopValuedCompanies,
  getCompanyEras, getCategoryFundingStats,
} from '@/lib/data';
import { THESIS_PRESETS } from '@/lib/scoring';
import { FullDashboard } from '@/components/dashboard/full-dashboard';

export default function Page() {
  const companies = loadCompanies();
  const stats = getDashboardStats();
  const categoryCounts = getCategoryCounts();
  const layerCounts = getLayerCounts();
  const geoCounts = getGeoCounts();
  const yearTrends = getYearTrends();
  const fundingByCategory = getFundingByCategory();
  const matrix = getCategoryLayerMatrix();
  const insights = generateInsights();
  const topFunded = getTopFundedCompanies(15);
  const topValued = getTopValuedCompanies(15);
  const eras = getCompanyEras();
  const categoryFundingStats = getCategoryFundingStats();

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">AI Landscape Intelligence</h1>
        <p className="text-zinc-400 mt-2 text-lg">{stats.totalCompanies} companies across the AI stack — funding, valuations, categories, and strategic positioning</p>
      </div>

      <FullDashboard
        companies={companies}
        stats={stats}
        categoryCounts={categoryCounts}
        layerCounts={layerCounts}
        geoCounts={geoCounts}
        yearTrends={yearTrends}
        fundingByCategory={fundingByCategory}
        matrix={matrix}
        insights={insights}
        topFunded={topFunded}
        topValued={topValued}
        eras={eras}
        categoryFundingStats={categoryFundingStats}
        thesisPresets={THESIS_PRESETS}
      />
    </div>
  );
}
