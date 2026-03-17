/**
 * Seed script for AI Landscape Database
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * This loads data/ai-landscape.csv and either:
 * 1. Populates a Supabase database (if NEXT_PUBLIC_SUPABASE_URL is set)
 * 2. Validates the CSV structure (dry run)
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface CSVRow {
  Company: string;
  Category: string;
  Subcategory?: string;
  Layer: string;
  Geo: string;
  'Year Founded'?: string;
  Description?: string;
  Notes?: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function validateRow(row: CSVRow, index: number): string[] {
  const errors: string[] = [];
  if (!row.Company?.trim()) errors.push(`Row ${index}: missing company name`);
  if (!row.Category?.trim()) errors.push(`Row ${index}: missing category`);
  if (!row.Layer?.trim()) errors.push(`Row ${index}: missing layer`);
  if (row['Year Founded']) {
    const year = parseInt(row['Year Founded']);
    if (isNaN(year) || year < 1900 || year > 2030) {
      errors.push(`Row ${index}: invalid year "${row['Year Founded']}"`);
    }
  }
  return errors;
}

async function main() {
  const csvPath = path.join(process.cwd(), 'data', 'ai-landscape.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at data/ai-landscape.csv');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { data, errors: parseErrors } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  if (parseErrors.length > 0) {
    console.error('CSV parse errors:', parseErrors);
    process.exit(1);
  }

  console.log(`Parsed ${data.length} rows from CSV\n`);

  // Validate
  const allErrors: string[] = [];
  data.forEach((row, i) => {
    allErrors.push(...validateRow(row, i + 2));
  });

  if (allErrors.length > 0) {
    console.error('Validation errors:');
    allErrors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Statistics
  const categories = new Set(data.map(r => r.Category));
  const layers = new Set(data.map(r => r.Layer));
  const geos = new Set(data.map(r => r.Geo));
  const slugs = new Set(data.map(r => slugify(r.Company)));

  console.log('Validation passed!\n');
  console.log('Dataset summary:');
  console.log(`  Companies: ${data.length}`);
  console.log(`  Unique slugs: ${slugs.size}`);
  console.log(`  Categories: ${categories.size} — ${[...categories].join(', ')}`);
  console.log(`  Layers: ${layers.size} — ${[...layers].join(', ')}`);
  console.log(`  Geographies: ${geos.size} — ${[...geos].join(', ')}`);

  if (slugs.size < data.length) {
    console.warn(`\n  Warning: ${data.length - slugs.size} potential duplicate slugs detected`);
  }

  // Check for Supabase connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.log('\nNo NEXT_PUBLIC_SUPABASE_URL set — dry run complete.');
    console.log('Set Supabase env vars to seed the database.');
    return;
  }

  console.log('\nSupabase connection detected. Seeding would happen here.');
  console.log('(Implement Supabase client insertion when ready)');
}

main().catch(console.error);
