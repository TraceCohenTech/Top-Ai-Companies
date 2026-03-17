import { getDashboardStats, getCategoryCounts, getLayerCounts, getGeoCounts, getYearTrends, getFundingByCategory, generateInsights } from '@/lib/data';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export default function DashboardPage() {
  const stats = getDashboardStats();
  const categoryCounts = getCategoryCounts();
  const layerCounts = getLayerCounts();
  const geoCounts = getGeoCounts();
  const yearTrends = getYearTrends();
  const fundingByCategory = getFundingByCategory();
  const insights = generateInsights();

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">AI Landscape Intelligence</h1>
        <p className="text-zinc-400 mt-1">Explore the AI ecosystem across categories, layers, and geographies</p>
      </div>

      <KPICards stats={stats} />

      <DashboardCharts
        categoryCounts={categoryCounts}
        layerCounts={layerCounts}
        geoCounts={geoCounts}
        yearTrends={yearTrends}
        fundingByCategory={fundingByCategory}
      />

      <Card>
        <CardHeader>
          <CardTitle>Derived Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <InsightsPanel insights={insights} />
        </CardContent>
      </Card>
    </div>
  );
}
