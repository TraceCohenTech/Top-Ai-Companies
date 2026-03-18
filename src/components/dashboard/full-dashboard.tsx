'use client';

import { useState, useMemo } from 'react';
import { Company, DashboardStats, CategoryCount, LayerCount, GeoCount, YearTrend, MatrixCell, Insight, ThesisPreset } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatNumber, CHART_COLORS, getChartColor } from '@/lib/utils';
import { rankCompaniesForThesis } from '@/lib/scoring';
import Link from 'next/link';
import {
  Building2, Layers, Globe, Calendar, DollarSign, Tag, TrendingUp,
  Search, ExternalLink, Lightbulb, AlertTriangle, ChevronRight,
  Users, Compass, Target, ArrowUpRight, Zap, Crown, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, ScatterChart, Scatter, ZAxis,
  Treemap,
} from 'recharts';

interface FullDashboardProps {
  companies: Company[];
  stats: DashboardStats;
  categoryCounts: CategoryCount[];
  layerCounts: LayerCount[];
  geoCounts: GeoCount[];
  yearTrends: YearTrend[];
  fundingByCategory: CategoryCount[];
  matrix: MatrixCell[];
  insights: Insight[];
  topFunded: Company[];
  topValued: Company[];
  eras: { era: string; range: string; count: number; companies: Company[] }[];
  categoryFundingStats: { category: string; totalFunding: number; avgFunding: number; count: number; topCompany: string }[];
  thesisPresets: ThesisPreset[];
}

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

const layerOrder = ['Foundation', 'Hardware', 'Cloud', 'Platform', 'Middleware', 'DevTools', 'Application'];

const layerColors: Record<string, string> = {
  Foundation: '#3b82f6',
  Hardware: '#f59e0b',
  Cloud: '#06b6d4',
  Platform: '#10b981',
  Middleware: '#8b5cf6',
  DevTools: '#f97316',
  Application: '#ec4899',
};

const insightIcons: Record<string, typeof Lightbulb> = {
  info: Lightbulb,
  warning: AlertTriangle,
  highlight: TrendingUp,
};

const insightColors: Record<string, string> = {
  info: 'border-zinc-700/50 bg-zinc-800/30',
  warning: 'border-amber-500/20 bg-amber-500/5',
  highlight: 'border-blue-500/20 bg-blue-500/5',
};

const insightIconColors: Record<string, string> = {
  info: 'text-zinc-400',
  warning: 'text-amber-400',
  highlight: 'text-blue-400',
};

const eraAccentColors = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#6366f1'];

const delayClass = (i: number) => {
  const delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700', 'delay-800'];
  return delays[i] || delays[delays.length - 1];
};

export function FullDashboard({
  companies,
  stats,
  categoryCounts,
  layerCounts,
  geoCounts,
  yearTrends,
  fundingByCategory,
  matrix,
  insights,
  topFunded,
  topValued,
  eras,
  categoryFundingStats,
  thesisPresets,
}: FullDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedThesis, setSelectedThesis] = useState<ThesisPreset>(thesisPresets[0]);

  const filteredCompanies = useMemo(() => {
    let result = companies;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.subcategory?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.investor_summary?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }
    return result;
  }, [companies, searchTerm, selectedCategory]);

  const rankedForThesis = useMemo(() => {
    return rankCompaniesForThesis(companies, selectedThesis).slice(0, 20);
  }, [companies, selectedThesis]);

  // Bubble data for scatter
  const bubbleData = useMemo(() => {
    return companies
      .filter(c => c.funding_total_usd && c.funding_total_usd > 0 && c.founded_year && c.founded_year >= 2005)
      .map(c => ({
        name: c.name,
        x: c.founded_year!,
        y: c.funding_total_usd!,
        z: Math.max(3, (c.employee_count || 50) / 50),
        category: c.category,
        slug: c.slug,
      }));
  }, [companies]);

  // Treemap data
  const treemapData = useMemo(() => {
    return categoryCounts.map((cat, i) => ({
      name: cat.name,
      size: cat.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [categoryCounts]);

  // Heatmap helpers
  const categories = [...new Set(matrix.map(d => d.category))].sort();
  const layers = [...new Set(matrix.map(d => d.layer))];
  layers.sort((a, b) => layerOrder.indexOf(a) - layerOrder.indexOf(b));
  const maxMatrixCount = Math.max(...matrix.map(d => d.count), 1);
  const getMatrixCount = (cat: string, layer: string) => matrix.find(d => d.category === cat && d.layer === layer)?.count || 0;

  // Company type breakdown
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    companies.forEach(c => { counts[c.company_type] = (counts[c.company_type] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [companies]);

  return (
    <div className="space-y-10">

      {/* ── HERO STATS ── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Companies', value: stats.totalCompanies.toString(), icon: Building2, accent: 'bg-blue-500/10 text-blue-400', glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]' },
            { label: 'Categories', value: stats.totalCategories.toString(), icon: Tag, accent: 'bg-emerald-500/10 text-emerald-400', glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]' },
            { label: 'Stack Layers', value: stats.totalLayers.toString(), icon: Layers, accent: 'bg-amber-500/10 text-amber-400', glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]' },
            { label: 'Geographies', value: stats.totalGeographies.toString(), icon: Globe, accent: 'bg-cyan-500/10 text-cyan-400', glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]' },
            { label: 'Avg Founded', value: stats.avgFoundedYear.toString(), icon: Calendar, accent: 'bg-rose-500/10 text-rose-400', glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]' },
            { label: 'Funding Tracked', value: formatCurrency(stats.totalFundingTracked), icon: DollarSign, accent: 'bg-indigo-500/10 text-indigo-400', glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]' },
          ].map((kpi, i) => (
            <Card key={kpi.label} className={`p-4 hover:border-white/[0.12] transition-all duration-300 group animate-fade-in-up ${delayClass(i)} ${kpi.glow}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.accent}`}>
                  <kpi.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight animate-count-up">{kpi.value}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── INSIGHTS TICKER ── */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((insight, i) => {
            const Icon = insightIcons[insight.severity];
            return (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${insightColors[insight.severity]} transition-all hover:border-white/[0.12] card-glow animate-slide-in-right ${delayClass(i)}`}>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${insightIconColors[insight.severity]}`} />
                <p className="text-[13px] text-zinc-300 leading-relaxed">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CATEGORY LANDSCAPE (Treemap + Bar) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
        <Card className="lg:col-span-3 card-glow">
          <CardHeader>
            <CardTitle className="animate-fade-in-up">Category Landscape</CardTitle>
            <CardDescription>Company density by category — click to filter</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="rgba(0,0,0,0.3)"
                content={(props: Record<string, unknown>) => {
                  const { x, y, width, height, name, size, fill } = props as { x: number; y: number; width: number; height: number; name: string; size: number; fill: string };
                  if (width < 40 || height < 30) return <g />;
                  const isSelected = selectedCategory === name;
                  const isDimmed = selectedCategory && selectedCategory !== name;
                  return (
                    <g onClick={() => setSelectedCategory(isSelected ? null : name)} style={{ cursor: 'pointer' }}>
                      <rect
                        x={x} y={y} width={width} height={height}
                        fill={fill}
                        opacity={isDimmed ? 0.25 : 0.85}
                        rx={4}
                        stroke={isSelected ? '#60a5fa' : 'rgba(0,0,0,0.3)'}
                        strokeWidth={isSelected ? 2.5 : 1}
                        style={{ transition: 'opacity 0.3s ease, stroke 0.3s ease, filter 0.3s ease', filter: isSelected ? 'drop-shadow(0 0 6px rgba(96,165,250,0.4))' : 'none' }}
                      />
                      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={width < 80 ? 10 : 12} fontWeight={600}>
                        {name}
                      </text>
                      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11}>
                        {size}
                      </text>
                    </g>
                  );
                }}
              />
            </ResponsiveContainer>
            {selectedCategory && (
              <div className="mt-3 flex items-center gap-2 animate-fade-in">
                <Badge variant="default">{selectedCategory}</Badge>
                <button onClick={() => setSelectedCategory(null)} className="text-xs text-zinc-500 hover:text-white transition-colors">Clear filter</button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 card-glow">
          <CardHeader>
            <CardTitle className="animate-fade-in-up">Stack Layers</CardTitle>
            <CardDescription>Distribution across the AI stack</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {layerCounts.sort((a, b) => layerOrder.indexOf(a.name) - layerOrder.indexOf(b.name)).map(layer => {
                const pct = (layer.count / stats.totalCompanies) * 100;
                return (
                  <div key={layer.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layerColors[layer.name] }} />
                        <span className="text-sm font-medium text-zinc-200">{layer.name}</span>
                      </div>
                      <span className="text-sm text-zinc-400 font-mono">{layer.count}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full animate-bar-grow"
                        style={{ width: `${pct}%`, backgroundColor: layerColors[layer.name] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-medium">Company Status</p>
              <div className="flex flex-wrap gap-2">
                {typeBreakdown.map(t => (
                  <div key={t.name} className="flex items-center gap-1.5 bg-zinc-800/50 rounded-lg px-3 py-1.5 hover:bg-zinc-800 transition-colors">
                    <span className="text-xs text-zinc-400 capitalize">{t.name}</span>
                    <span className="text-xs font-bold text-white">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── TOP FUNDED + TOP VALUED ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 animate-fade-in-up">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Most Funded
            </CardTitle>
            <CardDescription>Top companies by total capital raised</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topFunded.map((c, i) => {
                const maxFunding = topFunded[0].funding_total_usd || 1;
                const pct = ((c.funding_total_usd || 0) / maxFunding) * 100;
                return (
                  <Link key={c.id} href={`/companies/${c.slug}`} className="group flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <span className={`text-xs font-mono w-5 text-right ${i === 0 ? 'text-emerald-400 font-bold' : 'text-zinc-600'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">{c.name}</span>
                        <span className="text-xs font-mono text-emerald-400 ml-2 shrink-0">{formatCurrency(c.funding_total_usd)}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-emerald-500/60 rounded-full animate-bar-grow ${i === 0 ? 'animate-shimmer' : ''}`}
                          style={{ width: `${pct}%`, animationDelay: `${i * 80}ms`, ...(i === 0 ? { background: 'linear-gradient(90deg, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.9) 50%, rgba(16,185,129,0.6) 100%)', backgroundSize: '200% 100%' } : {}) }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 animate-fade-in-up">
              <Crown className="w-5 h-5 text-amber-400" />
              Highest Valued
            </CardTitle>
            <CardDescription>Top companies by valuation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topValued.map((c, i) => {
                const maxVal = topValued[0].valuation_usd || 1;
                const pct = ((c.valuation_usd || 0) / maxVal) * 100;
                return (
                  <Link key={c.id} href={`/companies/${c.slug}`} className="group flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <span className={`text-xs font-mono w-5 text-right ${i === 0 ? 'text-amber-400 font-bold' : 'text-zinc-600'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors truncate">{c.name}</span>
                        <span className="text-xs font-mono text-amber-400 ml-2 shrink-0">{formatCurrency(c.valuation_usd)}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-amber-500/60 rounded-full animate-bar-grow ${i === 0 ? 'animate-shimmer' : ''}`}
                          style={{ width: `${pct}%`, animationDelay: `${i * 80}ms`, ...(i === 0 ? { background: 'linear-gradient(90deg, rgba(245,158,11,0.6) 0%, rgba(245,158,11,0.9) 50%, rgba(245,158,11,0.6) 100%)', backgroundSize: '200% 100%' } : {}) }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── ERA TIMELINE ── */}
      <section>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 animate-fade-in-up">
              <Zap className="w-5 h-5 text-cyan-400" />
              AI Eras
            </CardTitle>
            <CardDescription>When companies were founded — the waves of AI development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {eras.map((era, i) => (
                <div
                  key={era.era}
                  className={`relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.15] transition-all duration-300 group hover:-translate-y-0.5 animate-fade-in-up ${delayClass(i)}`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: eraAccentColors[i % eraAccentColors.length] }}
                >
                  <div className="text-3xl font-bold text-white mb-1 animate-count-up">{era.count}</div>
                  <div className="text-sm font-medium text-zinc-300">{era.era}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{era.range}</div>
                  <div className="mt-3 space-y-0.5 max-h-[120px] overflow-y-auto">
                    {era.companies.slice(0, 8).map(c => (
                      <Link key={c.id} href={`/companies/${c.slug}`} className="block text-[11px] text-zinc-500 hover:text-blue-400 truncate transition-colors">
                        {c.name}
                      </Link>
                    ))}
                    {era.companies.length > 8 && (
                      <span className="text-[10px] text-zinc-600">+{era.companies.length - 8} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── FUNDING BUBBLE CHART + GEOGRAPHY ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <Card className="lg:col-span-2 card-glow">
          <CardHeader>
            <CardTitle className="animate-fade-in-up">Funding vs Founded Year</CardTitle>
            <CardDescription>Each dot is a company — size indicates team size</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" dataKey="x" name="Founded" domain={[2005, 2025]} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Funding" tickFormatter={(v) => formatCurrency(v)} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} />
                <ZAxis type="number" dataKey="z" range={[20, 300]} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                        <p className="text-sm font-semibold text-white">{d.name}</p>
                        <p className="text-xs text-zinc-400">{d.category}</p>
                        <p className="text-xs text-emerald-400 mt-1">Funding: {formatCurrency(d.y)}</p>
                        <p className="text-xs text-zinc-500">Founded: {d.x}</p>
                      </div>
                    );
                  }}
                />
                {[...new Set(bubbleData.map(d => d.category))].map((cat, i) => (
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

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 animate-fade-in-up">
              <Globe className="w-5 h-5 text-cyan-400" />
              Geography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {geoCounts.map((geo, i) => {
                const pct = (geo.count / stats.totalCompanies) * 100;
                return (
                  <div key={geo.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300">{geo.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{Math.round(pct)}%</span>
                        <span className="text-sm font-mono text-white w-6 text-right">{geo.count}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full animate-bar-grow" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length], animationDelay: `${i * 100}ms` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── CATEGORY x LAYER HEATMAP ── */}
      <section>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="animate-fade-in-up">Category x Layer Matrix</CardTitle>
            <CardDescription>Where companies cluster across the stack — darker = more concentration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid" style={{ gridTemplateColumns: `180px repeat(${layers.length}, 1fr)` }}>
                  <div className="p-2" />
                  {layers.map(layer => (
                    <div key={layer} className="p-2 text-[11px] font-medium text-zinc-400 text-center uppercase tracking-wider">
                      {layer}
                    </div>
                  ))}
                  {categories.map(category => (
                    <div key={category} className="contents">
                      <div className="p-2 text-xs font-medium text-zinc-300 flex items-center">{category}</div>
                      {layers.map(layer => {
                        const count = getMatrixCount(category, layer);
                        const opacity = count === 0 ? 0.02 : 0.15 + (count / maxMatrixCount) * 0.85;
                        return (
                          <div key={`${category}-${layer}`} className="p-1">
                            <div
                              className="rounded-lg h-10 flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-105 hover:brightness-125 cursor-default"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                                color: count > 0 ? '#e4e4e7' : 'transparent',
                              }}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── FUNDING BY CATEGORY + YEAR TREND ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="animate-fade-in-up">Capital Concentration</CardTitle>
            <CardDescription>Total funding tracked by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryFundingStats.filter(c => c.totalFunding > 0).map((cat, i) => {
                const maxF = categoryFundingStats[0].totalFunding;
                const pct = (cat.totalFunding / maxF) * 100;
                return (
                  <div key={cat.category} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-zinc-200 truncate">{cat.category}</span>
                        <span className="text-[10px] text-zinc-600 shrink-0">{cat.count} cos</span>
                      </div>
                      <span className="text-sm font-mono text-zinc-300 ml-2 shrink-0">{formatCurrency(cat.totalFunding)}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full animate-bar-grow" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length], animationDelay: `${i * 60}ms` }} />
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">
                      Avg {formatCurrency(cat.avgFunding)} per company · Top: {cat.topCompany}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="animate-fade-in-up">Founding Year Wave</CardTitle>
            <CardDescription>When were today&apos;s AI companies born?</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={yearTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="yearGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="year" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fill="url(#yearGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ── THESIS OVERLAY ── */}
      <section>
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 animate-fade-in-up">
              <Compass className="w-5 h-5 text-indigo-400" />
              Investment Thesis Overlay
            </CardTitle>
            <CardDescription>Select a thesis to score and rank companies by alignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {thesisPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedThesis(preset)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedThesis.id === preset.id
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 animate-glow-pulse'
                      : 'bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/[0.12] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <p className="text-sm text-zinc-400 mb-4 animate-fade-in">{selectedThesis.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {rankedForThesis.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.slug}`}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:border-indigo-500/20 hover:bg-indigo-500/[0.03] transition-all duration-200 group card-glow"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${i < 3 ? 'bg-indigo-500/15' : 'bg-indigo-500/10'}`}>
                    <span className={`text-[10px] font-bold ${i < 3 ? 'text-indigo-300' : 'text-indigo-400'}`}>{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors truncate">{c.name}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{c.category} · {c.layer}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full animate-bar-grow" style={{ width: `${c.thesisScore * 10}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400">{c.thesisScore}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── FULL COMPANY TABLE ── */}
      <section>
        <Card className="card-glow">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="animate-fade-in-up">Full Company Directory</CardTitle>
                <CardDescription>{filteredCompanies.length} companies{selectedCategory ? ` in ${selectedCategory}` : ''}{searchTerm ? ` matching "${searchTerm}"` : ''}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search companies, categories, investors..."
                    className="pl-9 w-[320px]"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                {(searchTerm || selectedCategory) && (
                  <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Company', 'Category', 'Layer', 'Geo', 'Founded', 'Funding', 'Valuation', 'Type', 'Employees'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c, rowIdx) => (
                    <tr key={c.id} className={`border-b border-white/[0.03] transition-colors group table-row-accent ${rowIdx % 2 === 1 ? 'bg-white/[0.01]' : ''} hover:bg-white/[0.03]`}>
                      <td className="px-3 py-2.5">
                        <Link href={`/companies/${c.slug}`} className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                          {c.name}
                          <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                        </Link>
                        {c.description && (
                          <p className="text-[11px] text-zinc-600 mt-0.5 truncate max-w-[280px]">{c.description}</p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-zinc-300">{c.category}</span>
                        {c.subcategory && <span className="text-[10px] text-zinc-600 block">{c.subcategory}</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layerColors[c.layer] || '#71717a' }} />
                          {c.layer}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-zinc-400">{c.geography}</td>
                      <td className="px-3 py-2.5 text-xs text-zinc-400 font-mono">{c.founded_year || '\u2014'}</td>
                      <td className="px-3 py-2.5 text-xs text-emerald-400/80 font-mono">{formatCurrency(c.funding_total_usd)}</td>
                      <td className="px-3 py-2.5 text-xs text-amber-400/80 font-mono">{formatCurrency(c.valuation_usd)}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={c.company_type === 'public' ? 'success' : c.company_type === 'acquired' ? 'warning' : 'secondary'} className="text-[10px]">
                          {c.company_type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-zinc-400">{c.employee_count ? formatNumber(c.employee_count) : '\u2014'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
