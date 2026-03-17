'use client';

import { CategoryCount, GeoCount, YearTrend } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { CategoryBarChart } from '@/components/charts/category-bar-chart';
import { GeoBarChart } from '@/components/charts/geo-bar-chart';
import { YearLineChart } from '@/components/charts/year-line-chart';
import { FundingChart } from '@/components/charts/funding-chart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { formatCurrency, CHART_COLORS } from '@/lib/utils';

interface BubblePoint {
  name: string;
  x: number;
  y: number;
  z: number;
  category: string;
  layer: string;
}

interface Props {
  categoryCounts: CategoryCount[];
  geoCounts: GeoCount[];
  yearTrends: YearTrend[];
  fundingByCategory: CategoryCount[];
  bubbleData: BubblePoint[];
}

export function MarketMapCharts({ categoryCounts, geoCounts, yearTrends, fundingByCategory, bubbleData }: Props) {
  const categories = [...new Set(bubbleData.map(d => d.category))];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funding Concentration</CardTitle>
            <CardDescription>Total tracked funding by category</CardDescription>
          </CardHeader>
          <CardContent>
            <FundingChart data={fundingByCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Company count by geography</CardDescription>
          </CardHeader>
          <CardContent>
            <GeoBarChart data={geoCounts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funding vs Founded Year</CardTitle>
          <CardDescription>Bubble chart showing funding relative to founding year, sized by category density</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number"
                dataKey="x"
                name="Founded"
                domain={['auto', 'auto']}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Funding"
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
              />
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                }}
                formatter={(value, name) => {
                  if (name === 'Funding') return [formatCurrency(value as number), name];
                  return [value as number, name];
                }}
                labelFormatter={() => ''}
              />
              {categories.map((cat, i) => (
                <Scatter
                  key={cat}
                  name={cat}
                  data={bubbleData.filter(d => d.category === cat)}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  opacity={0.7}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Founded Year Trends</CardTitle>
            <CardDescription>Number of companies founded per year</CardDescription>
          </CardHeader>
          <CardContent>
            <YearLineChart data={yearTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Density</CardTitle>
            <CardDescription>Company count by category — higher density suggests crowding</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryCounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
