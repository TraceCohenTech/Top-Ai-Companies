'use client';

import { useState, useMemo } from 'react';
import { Company, ThesisPreset } from '@/types';
import { rankCompaniesForThesis } from '@/lib/scoring';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Compass, Target, TrendingUp, ExternalLink } from 'lucide-react';

interface Props {
  companies: Company[];
  presets: ThesisPreset[];
}

export function ThesisOverlay({ companies, presets }: Props) {
  const [selectedThesis, setSelectedThesis] = useState<ThesisPreset>(presets[0]);
  const [minScore, setMinScore] = useState(2);

  const ranked = useMemo(() => {
    return rankCompaniesForThesis(companies, selectedThesis)
      .filter(c => c.thesisScore >= minScore);
  }, [companies, selectedThesis, minScore]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    ranked.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [ranked]);

  const layerBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    ranked.forEach(c => {
      counts[c.layer] = (counts[c.layer] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [ranked]);

  return (
    <div className="space-y-6">
      {/* Thesis selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => setSelectedThesis(preset)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedThesis.id === preset.id
                ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            <Compass className={`w-4 h-4 mb-2 ${selectedThesis.id === preset.id ? 'text-blue-400' : 'text-zinc-500'}`} />
            <p className="text-sm font-medium text-white">{preset.name}</p>
            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Thesis detail + controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{selectedThesis.name}</CardTitle>
            <CardDescription>{selectedThesis.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">Minimum Score: {minScore}</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={minScore}
                onChange={e => setMinScore(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <p className="text-xs text-zinc-500 mb-2">Category Weights</p>
              {Object.entries(selectedThesis.weights).map(([cat, weight]) => (
                <div key={cat} className="flex items-center justify-between py-1">
                  <span className="text-xs text-zinc-300">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${weight * 10}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500 w-4 text-right">{weight}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{ranked.length}</span>
                <span className="text-xs text-zinc-500">matching companies</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Category breakdown:</p>
                {categoryBreakdown.slice(0, 5).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{cat}</span>
                    <span className="text-xs text-zinc-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ranked Companies</CardTitle>
            <CardDescription>Sorted by thesis fit score for "{selectedThesis.name}"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Rank</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Layer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Geo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Funding</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.slice(0, 50).map((company, i) => (
                    <tr key={company.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-2.5 text-xs text-zinc-500 font-mono">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <Link href={`/companies/${company.slug}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                          {company.name}
                          <ExternalLink className="w-3 h-3 text-zinc-600" />
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-zinc-300">{company.category}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary">{company.layer}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-zinc-400">{company.geography}</td>
                      <td className="px-3 py-2.5 text-sm text-zinc-300 font-mono">{formatCurrency(company.funding_total_usd)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${company.thesisScore * 10}%` }} />
                          </div>
                          <span className="text-xs font-medium text-emerald-400">{company.thesisScore}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
