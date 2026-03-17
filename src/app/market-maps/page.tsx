import { getCategoryLayerMatrix, getCategoryCounts, getLayerCounts, getGeoCounts, getYearTrends, getFundingByCategory, loadCompanies } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { HeatmapChart } from '@/components/charts/heatmap';
import { MarketMapCharts } from '@/components/market-maps/market-map-charts';

export default function MarketMapsPage() {
  const matrix = getCategoryLayerMatrix();
  const categoryCounts = getCategoryCounts();
  const geoCounts = getGeoCounts();
  const yearTrends = getYearTrends();
  const fundingByCategory = getFundingByCategory();
  const companies = loadCompanies();

  // Bubble data: funding vs year vs category
  const bubbleData = companies
    .filter(c => c.funding_total_usd && c.founded_year)
    .map(c => ({
      name: c.name,
      x: c.founded_year!,
      y: c.funding_total_usd!,
      z: c.overcrowded_score || 5,
      category: c.category,
      layer: c.layer,
    }));

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Market Maps</h1>
        <p className="text-zinc-400 text-sm mt-1">Strategic visual analysis of the AI landscape</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category x Layer Matrix</CardTitle>
          <CardDescription>Heatmap showing company concentration by category and stack layer</CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapChart data={matrix} />
        </CardContent>
      </Card>

      <MarketMapCharts
        categoryCounts={categoryCounts}
        geoCounts={geoCounts}
        yearTrends={yearTrends}
        fundingByCategory={fundingByCategory}
        bubbleData={bubbleData}
      />
    </div>
  );
}
