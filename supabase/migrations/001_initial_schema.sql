-- AI Landscape Intelligence Dashboard Schema
-- This migration creates the full relational schema for Supabase

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, category_id)
);

-- Layers
CREATE TABLE IF NOT EXISTS layers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Geographies
CREATE TABLE IF NOT EXISTS geographies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  layer_id UUID REFERENCES layers(id),
  geography_id UUID REFERENCES geographies(id),
  founded_year INT,
  description TEXT,
  notes TEXT,
  website TEXT,
  funding_total_usd BIGINT,
  last_round_name TEXT,
  last_round_usd BIGINT,
  last_round_date DATE,
  valuation_usd BIGINT,
  investor_summary TEXT,
  company_type TEXT DEFAULT 'private' CHECK (company_type IN ('private', 'public', 'acquired', 'unknown')),
  ticker TEXT,
  employee_count INT,
  revenue_estimate BIGINT,
  thesis_fit_score NUMERIC(4,2),
  overcrowded_score NUMERIC(4,2),
  strategic_importance_score NUMERIC(4,2),
  data_completeness_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tag_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Company Tags (many-to-many)
CREATE TABLE IF NOT EXISTS company_tags (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (company_id, tag_id)
);

-- Investors
CREATE TABLE IF NOT EXISTS investors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  investor_type TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Company Investors (many-to-many)
CREATE TABLE IF NOT EXISTS company_investors (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  round_name TEXT,
  lead BOOLEAN DEFAULT false,
  PRIMARY KEY (company_id, investor_id, round_name)
);

-- Funding Rounds
CREATE TABLE IF NOT EXISTS funding_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL,
  amount_usd BIGINT,
  date DATE,
  lead_investor TEXT,
  post_valuation_usd BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Strategic Scores (for thesis overlays)
CREATE TABLE IF NOT EXISTS strategic_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  thesis_name TEXT NOT NULL,
  score NUMERIC(4,2) NOT NULL,
  weights JSONB,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, thesis_name)
);

-- Data Sources
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  confidence_score INT DEFAULT 50,
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category_id);
CREATE INDEX IF NOT EXISTS idx_companies_layer ON companies(layer_id);
CREATE INDEX IF NOT EXISTS idx_companies_geography ON companies(geography_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_founded_year ON companies(founded_year);
CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_funding_rounds_company ON funding_rounds(company_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed layers
INSERT INTO layers (name, display_order, description) VALUES
  ('Foundation', 1, 'Frontier and foundation model builders'),
  ('Hardware', 2, 'Chips, GPUs, and AI-specific silicon'),
  ('Cloud', 3, 'Cloud compute and GPU infrastructure'),
  ('Platform', 4, 'Data platforms, MLOps, and model serving'),
  ('Middleware', 5, 'Agent frameworks, orchestration, and observability'),
  ('DevTools', 6, 'Developer tools, IDEs, and coding assistants'),
  ('Application', 7, 'End-user applications and vertical solutions')
ON CONFLICT (name) DO NOTHING;
