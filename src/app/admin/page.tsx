import { loadCompanies, getDashboardStats } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AdminTools } from '@/components/admin/admin-tools';
import { calculateCompletenessScore } from '@/lib/utils';

export default function AdminPage() {
  const companies = loadCompanies();
  const stats = getDashboardStats();

  const completeness = companies.map(c => calculateCompletenessScore(c as unknown as Record<string, unknown>));
  const avgCompleteness = Math.round(completeness.reduce((a, b) => a + b, 0) / completeness.length);

  const duplicateCheck = companies.reduce((acc, c) => {
    const key = c.name.toLowerCase().trim();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const duplicates = Object.entries(duplicateCheck).filter(([_, count]) => count > 1);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Admin & Data Tools</h1>
        <p className="text-zinc-400 text-sm mt-1">Import, validate, and manage the AI landscape database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Avg Data Completeness</p>
          <p className="text-2xl font-bold text-white">{avgCompleteness}%</p>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgCompleteness}%` }} />
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 mb-1">Potential Duplicates</p>
          <p className="text-2xl font-bold text-white">{duplicates.length}</p>
          {duplicates.length > 0 && (
            <p className="text-xs text-amber-400 mt-1">
              {duplicates.map(([name]) => name).join(', ')}
            </p>
          )}
        </Card>
      </div>

      <AdminTools companies={companies} />
    </div>
  );
}
