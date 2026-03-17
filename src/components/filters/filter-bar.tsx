'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FilterOption {
  label: string;
  key: string;
  options: string[];
}

interface Props {
  filterOptions: FilterOption[];
}

export function FilterBar({ filterOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const activeFilters: Record<string, string[]> = {};
  filterOptions.forEach(fo => {
    const val = searchParams.get(fo.key);
    if (val) activeFilters[fo.key] = val.split(',');
  });

  const totalActive = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  const updateParams = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [searchParams, pathname, router]);

  const toggleFilter = useCallback((key: string, value: string) => {
    const current = activeFilters[key] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateParams(key, next.length > 0 ? next.join(',') : null);
  }, [activeFilters, updateParams]);

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);

  return (
    <div className="sticky top-14 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-white/[0.06] py-3">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search companies..."
              className="pl-9"
              value={search}
              onChange={(e) => updateParams('search', e.target.value || null)}
            />
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {totalActive > 0 && (
              <span className="bg-blue-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {totalActive}
              </span>
            )}
          </Button>

          {totalActive > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-zinc-500 gap-1">
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}

          {isPending && (
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          )}
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-white/[0.04]">
            {filterOptions.map(fo => (
              <div key={fo.key}>
                <label className="text-xs font-medium text-zinc-500 mb-2 block">{fo.label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {fo.options.map(opt => {
                    const isActive = activeFilters[fo.key]?.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleFilter(fo.key, opt)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-zinc-600'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalActive > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(activeFilters).map(([key, values]) =>
              values.map(v => (
                <Badge key={`${key}-${v}`} variant="default" className="gap-1 cursor-pointer" onClick={() => toggleFilter(key, v)}>
                  {v}
                  <X className="w-3 h-3" />
                </Badge>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
