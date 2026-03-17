import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { slugify, normalizeCompanyName, normalizeCategory, normalizeGeo } from '@/lib/utils';
import { loadCompanies } from '@/lib/data';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing errors',
        details: errors.slice(0, 5),
      }, { status: 400 });
    }

    const rows = data as Record<string, string>[];
    const existing = loadCompanies();
    const existingSlugs = new Set(existing.map(c => c.slug));

    let imported = 0;
    let skipped = 0;
    const importErrors: string[] = [];

    const newRows: string[] = [];

    for (const row of rows) {
      const name = normalizeCompanyName(row['Company'] || '');
      if (!name) {
        importErrors.push('Row with empty company name skipped');
        skipped++;
        continue;
      }

      const slug = slugify(name);
      if (existingSlugs.has(slug)) {
        skipped++;
        continue;
      }

      newRows.push([
        name,
        normalizeCategory(row['Category'] || 'Uncategorized'),
        row['Subcategory']?.trim() || '',
        row['Layer']?.trim() || 'Unknown',
        normalizeGeo(row['Geo'] || 'Unknown'),
        row['Year Founded']?.trim() || '',
        row['Description']?.trim() || '',
        row['Notes']?.trim() || '',
      ].join(','));

      existingSlugs.add(slug);
      imported++;
    }

    // Append to CSV
    if (newRows.length > 0) {
      const csvPath = path.join(process.cwd(), 'data', 'ai-landscape.csv');
      fs.appendFileSync(csvPath, '\n' + newRows.join('\n'));
    }

    return NextResponse.json({
      total: rows.length,
      imported,
      skipped,
      errors: importErrors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Import failed', details: String(error) },
      { status: 500 }
    );
  }
}
