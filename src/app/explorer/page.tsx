import { getFilteredCompanies, getUniqueValues } from '@/lib/data';
import { CompanyFilters } from '@/types';
import { FilterBar } from '@/components/filters/filter-bar';
import { CompanyTable } from '@/components/explorer/company-table';
import { Suspense } from 'react';

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ExplorerPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters: CompanyFilters = {
    search: params.search || undefined,
    categories: params.categories?.split(',') || undefined,
    subcategories: params.subcategories?.split(',') || undefined,
    layers: params.layers?.split(',') || undefined,
    geographies: params.geographies?.split(',') || undefined,
    companyType: params.companyType?.split(',') || undefined,
    sortBy: params.sortBy || 'name',
    sortOrder: (params.sortOrder as 'asc' | 'desc') || 'asc',
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 25,
  };

  const allCompanies = getFilteredCompanies(filters);
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 25;
  const paginatedCompanies = allCompanies.slice((page - 1) * pageSize, page * pageSize);

  const filterOptions = [
    { label: 'Category', key: 'categories', options: getUniqueValues('category') },
    { label: 'Layer', key: 'layers', options: getUniqueValues('layer') },
    { label: 'Geography', key: 'geographies', options: getUniqueValues('geography') },
    { label: 'Type', key: 'companyType', options: ['private', 'public', 'acquired'] },
  ];

  return (
    <div>
      <Suspense>
        <FilterBar filterOptions={filterOptions} />
      </Suspense>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Company Explorer</h1>
            <p className="text-zinc-400 text-sm mt-1">{allCompanies.length} companies matching current filters</p>
          </div>
        </div>

        <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
          <CompanyTable
            companies={paginatedCompanies}
            total={allCompanies.length}
            page={page}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
