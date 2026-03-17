'use client';

import { useState, useRef } from 'react';
import { Company, CSVRow, ImportResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { calculateCompletenessScore, formatCurrency } from '@/lib/utils';
import { Upload, Download, Search, CheckCircle, AlertTriangle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

interface Props {
  companies: Company[];
}

export function AdminTools({ companies }: Props) {
  const [activeTab, setActiveTab] = useState<'import' | 'browse' | 'export'>('import');
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [editSearch, setEditSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
      setCsvPreview(data as Record<string, string>[]);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvPreview.length === 0) return;
    // In production, this would POST to /api/import
    setImportResult({
      total: csvPreview.length,
      imported: csvPreview.length,
      skipped: 0,
      errors: [],
    });
  };

  const handleExport = () => {
    const csv = Papa.unparse(companies.map(c => ({
      Company: c.name,
      Category: c.category,
      Subcategory: c.subcategory || '',
      Layer: c.layer,
      Geo: c.geography,
      'Year Founded': c.founded_year || '',
      Description: c.description || '',
      Notes: c.notes || '',
      Website: c.website || '',
      'Funding Total': c.funding_total_usd || '',
      'Last Round': c.last_round_name || '',
      'Company Type': c.company_type,
      'Thesis Fit Score': c.thesis_fit_score || '',
      'Overcrowded Score': c.overcrowded_score || '',
      'Strategic Importance': c.strategic_importance_score || '',
    })));

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-landscape-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCompanies = editSearch
    ? companies.filter(c =>
        c.name.toLowerCase().includes(editSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(editSearch.toLowerCase())
      )
    : companies.slice(0, 20);

  const tabs = [
    { id: 'import' as const, label: 'Import CSV', icon: Upload },
    { id: 'browse' as const, label: 'Browse & Edit', icon: Search },
    { id: 'export' as const, label: 'Export', icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-zinc-400" />
              CSV Import
            </CardTitle>
            <CardDescription>Upload a CSV file to preview and import new companies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">Click to upload or drag a CSV file</p>
              <p className="text-xs text-zinc-600 mt-1">Supports standard AI landscape CSV format</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {csvPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-300">
                    <span className="font-medium">{csvPreview.length}</span> rows parsed
                  </p>
                  <Button size="sm" onClick={handleImport} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Import All
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {Object.keys(csvPreview[0]).slice(0, 6).map(key => (
                          <th key={key} className="px-3 py-2 text-left text-xs font-medium text-zinc-500">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03]">
                          {Object.values(row).slice(0, 6).map((val, j) => (
                            <td key={j} className="px-3 py-2 text-sm text-zinc-300 truncate max-w-[200px]">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvPreview.length > 10 && (
                  <p className="text-xs text-zinc-500">Showing 10 of {csvPreview.length} rows</p>
                )}
              </div>
            )}

            {importResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">Import Complete</span>
                </div>
                <p className="text-xs text-zinc-400">
                  {importResult.imported} imported, {importResult.skipped} skipped, {importResult.errors.length} errors
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'browse' && (
        <Card>
          <CardHeader>
            <CardTitle>Browse Companies</CardTitle>
            <CardDescription>Search and review company records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by name or category..."
              value={editSearch}
              onChange={e => setEditSearch(e.target.value)}
            />
            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Company</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Layer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Funding</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500">Completeness</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map(c => {
                    const score = calculateCompletenessScore(c as unknown as Record<string, unknown>);
                    return (
                      <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-3 py-2.5 text-sm font-medium text-white">{c.name}</td>
                        <td className="px-3 py-2.5 text-sm text-zinc-300">{c.category}</td>
                        <td className="px-3 py-2.5"><Badge variant="secondary">{c.layer}</Badge></td>
                        <td className="px-3 py-2.5 text-sm text-zinc-300 font-mono">{formatCurrency(c.funding_total_usd)}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500">{score}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'export' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-zinc-400" />
              Export Data
            </CardTitle>
            <CardDescription>Download the current dataset with all enrichment and scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-sm text-zinc-300 mb-2">Export includes:</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>All {companies.length} companies</li>
                <li>Core fields: name, category, subcategory, layer, geography, founding year</li>
                <li>Enrichment: funding, last round, company type, website</li>
                <li>Derived scores: thesis fit, overcrowded, strategic importance</li>
              </ul>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
