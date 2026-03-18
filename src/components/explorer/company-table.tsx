'use client';

import { Company } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpDown, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';

interface Props {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
}

const columns = [
  { key: 'name', label: 'Company', width: 'w-[200px]' },
  { key: 'category', label: 'Category', width: 'w-[140px]' },
  { key: 'subcategory', label: 'Subcategory', width: 'w-[140px]' },
  { key: 'layer', label: 'Layer', width: 'w-[100px]' },
  { key: 'geography', label: 'Geo', width: 'w-[80px]' },
  { key: 'founded_year', label: 'Founded', width: 'w-[80px]' },
  { key: 'funding_total_usd', label: 'Funding', width: 'w-[100px]' },
  { key: 'valuation_usd', label: 'Valuation', width: 'w-[100px]' },
  { key: 'company_type', label: 'Type', width: 'w-[80px]' },
  { key: 'employee_count', label: 'Employees', width: 'w-[80px]' },
];

const layerColors: Record<string, string> = {
  'Foundation': 'success',
  'Hardware': 'warning',
  'Cloud': 'default',
  'Platform': 'secondary',
  'Middleware': 'outline',
  'DevTools': 'default',
  'Application': 'secondary',
};

function ScoreBar({ score, max = 10, color = 'blue' }: { score: number | null; max?: number; color?: string }) {
  if (score == null) return <span className="text-zinc-600">—</span>;
  const pct = (score / max) * 100;
  const colorClass = color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-emerald-500' : 'bg-blue-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-400">{score}</span>
    </div>
  );
}

export function CompanyTable({ companies, total, page, pageSize }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);

  const handleSort = useCallback((key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get('sortBy');
    const currentOrder = params.get('sortOrder') || 'asc';
    if (currentSort === key) {
      params.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', key);
      params.set('sortOrder', 'asc');
    }
    startTransition(() => { router.push(`${pathname}?${params.toString()}`); });
  }, [searchParams, pathname, router]);

  const handlePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    startTransition(() => { router.push(`${pathname}?${params.toString()}`); });
  }, [searchParams, pathname, router]);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`${col.width} px-4 py-3 text-left text-xs font-medium text-zinc-500 cursor-pointer hover:text-white transition-colors`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr
                key={company.id}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <Link href={`/companies/${company.slug}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    {company.name}
                    <ExternalLink className="w-3 h-3 text-zinc-600" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">{company.category}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{company.subcategory || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={layerColors[company.layer] as 'default' || 'secondary'}>
                    {company.layer}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{company.geography}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{company.founded_year || '—'}</td>
                <td className="px-4 py-3 text-sm text-zinc-300 font-mono">
                  {formatCurrency(company.funding_total_usd)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300 font-mono">
                  {formatCurrency(company.valuation_usd)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={company.company_type === 'public' ? 'success' : company.company_type === 'acquired' ? 'warning' : 'secondary'}>
                    {company.company_type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {company.employee_count ? company.employee_count.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-zinc-500">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-zinc-400">
            {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePage(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
