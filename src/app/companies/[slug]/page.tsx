import { getCompanyBySlug, getRelatedCompanies, loadCompanies } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Calendar, MapPin, Building2, DollarSign, Users, TrendingUp, Layers } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const companies = loadCompanies();
  return companies.map(c => ({ slug: c.slug }));
}

function ScoreCard({ label, score, max = 10, description }: { label: string; score: number | null; max?: number; description: string }) {
  if (score == null) return null;
  const pct = (score / max) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm font-medium text-white">{score}/{max}</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  );
}

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const related = getRelatedCompanies(company);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      <Link href="/explorer" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Explorer
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default">{company.category}</Badge>
                  {company.subcategory && <Badge variant="secondary">{company.subcategory}</Badge>}
                  <Badge variant="outline">{company.layer}</Badge>
                  {company.company_type === 'public' && <Badge variant="success">Public</Badge>}
                </div>
              </div>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>

            {company.description && (
              <p className="text-zinc-300 leading-relaxed mb-6">{company.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{company.geography}</span>
              </div>
              {company.founded_year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">Founded {company.founded_year}</span>
                </div>
              )}
              {company.employee_count && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">{formatNumber(company.employee_count)} employees</span>
                </div>
              )}
              {company.funding_total_usd && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-300">{formatCurrency(company.funding_total_usd)} raised</span>
                </div>
              )}
            </div>
          </Card>

          {/* Funding details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-zinc-400" />
                Funding & Financials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total Funding</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(company.funding_total_usd)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Last Round</p>
                  <p className="text-lg font-semibold text-white">{company.last_round_name || '—'}</p>
                </div>
                {company.last_round_usd && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Last Round Size</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(company.last_round_usd)}</p>
                  </div>
                )}
                {company.valuation_usd && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Valuation</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(company.valuation_usd)}</p>
                  </div>
                )}
                {company.revenue_estimate && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Revenue Estimate</p>
                    <p className="text-lg font-semibold text-white">{formatCurrency(company.revenue_estimate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Company Type</p>
                  <p className="text-lg font-semibold text-white capitalize">{company.company_type}</p>
                </div>
                {company.ticker && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Ticker</p>
                    <p className="text-lg font-semibold text-white">{company.ticker}</p>
                  </div>
                )}
                {company.last_round_date && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Last Round Date</p>
                    <p className="text-lg font-semibold text-white">{company.last_round_date}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {company.investor_summary && (
            <Card>
              <CardHeader>
                <CardTitle>Investors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {company.investor_summary.split(',').map((inv, i) => (
                    <Badge key={i} variant="secondary">{inv.trim()}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {company.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 leading-relaxed">{company.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-zinc-400" />
                Strategic Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ScoreCard
                label="Thesis Fit"
                score={company.thesis_fit_score}
                description="Alignment with key investment themes"
              />
              <ScoreCard
                label="Overcrowded"
                score={company.overcrowded_score}
                description="Category density relative to landscape"
              />
              <ScoreCard
                label="Strategic Importance"
                score={company.strategic_importance_score}
                description="Layer importance, uniqueness, maturity"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-zinc-400" />
                Stack Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Layer</p>
                  <p className="text-sm text-white font-medium">{company.layer}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Category</p>
                  <p className="text-sm text-white font-medium">{company.category}</p>
                </div>
                {company.subcategory && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Subcategory</p>
                    <p className="text-sm text-white font-medium">{company.subcategory}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-zinc-400" />
                Related Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {related.map(r => (
                  <Link
                    key={r.id}
                    href={`/companies/${r.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{r.name}</p>
                      <p className="text-xs text-zinc-500">{r.subcategory || r.category}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{r.layer}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
