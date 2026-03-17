'use client';

import { CategoryCount, LayerCount, GeoCount, YearTrend } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CategoryBarChart } from '@/components/charts/category-bar-chart';
import { LayerDonutChart } from '@/components/charts/layer-donut-chart';
import { YearLineChart } from '@/components/charts/year-line-chart';
import { GeoBarChart } from '@/components/charts/geo-bar-chart';
import { FundingChart } from '@/components/charts/funding-chart';
import { useRouter } from 'next/navigation';

interface Props {
  categoryCounts: CategoryCount[];
  layerCounts: LayerCount[];
  geoCounts: GeoCount[];
  yearTrends: YearTrend[];
  fundingByCategory: CategoryCount[];
}

export function DashboardCharts({ categoryCounts, layerCounts, geoCounts, yearTrends, fundingByCategory }: Props) {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/explorer?categories=${encodeURIComponent(category)}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Companies by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryCounts} onCategoryClick={handleCategoryClick} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stack Layer Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <LayerDonutChart data={layerCounts} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Companies Founded by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <YearLineChart data={yearTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <GeoBarChart data={geoCounts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funding by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <FundingChart data={fundingByCategory} />
        </CardContent>
      </Card>
    </div>
  );
}
