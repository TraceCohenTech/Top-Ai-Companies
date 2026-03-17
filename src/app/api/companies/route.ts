import { NextRequest, NextResponse } from 'next/server';
import { getFilteredCompanies, getCompanyBySlug } from '@/lib/data';
import { CompanyFilters } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters: CompanyFilters = {
    search: searchParams.get('search') || undefined,
    categories: searchParams.get('categories')?.split(',') || undefined,
    subcategories: searchParams.get('subcategories')?.split(',') || undefined,
    layers: searchParams.get('layers')?.split(',') || undefined,
    geographies: searchParams.get('geographies')?.split(',') || undefined,
    companyType: searchParams.get('companyType')?.split(',') || undefined,
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 25,
  };

  const companies = getFilteredCompanies(filters);
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 25;

  return NextResponse.json({
    data: companies.slice((page - 1) * pageSize, page * pageSize),
    total: companies.length,
    page,
    pageSize,
    totalPages: Math.ceil(companies.length / pageSize),
  });
}
