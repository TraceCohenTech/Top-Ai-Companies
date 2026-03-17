'use client';

import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Building2, Layers, Globe, Calendar, DollarSign, Tag } from 'lucide-react';

interface Props {
  stats: DashboardStats;
}

const kpis = [
  { key: 'totalCompanies', label: 'Companies', icon: Building2, format: (v: number) => v.toString() },
  { key: 'totalCategories', label: 'Categories', icon: Tag, format: (v: number) => v.toString() },
  { key: 'totalLayers', label: 'Stack Layers', icon: Layers, format: (v: number) => v.toString() },
  { key: 'totalGeographies', label: 'Geographies', icon: Globe, format: (v: number) => v.toString() },
  { key: 'avgFoundedYear', label: 'Avg Founded', icon: Calendar, format: (v: number) => v.toString() },
  { key: 'totalFundingTracked', label: 'Funding Tracked', icon: DollarSign, format: (v: number) => formatCurrency(v) },
] as const;

export function KPICards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map(({ key, label, icon: Icon, format }) => (
        <Card key={key} className="p-4 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">{label}</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {format(stats[key])}
          </div>
        </Card>
      ))}
    </div>
  );
}
