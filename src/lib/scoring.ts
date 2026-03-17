import { Company, ThesisPreset } from '@/types';

export const THESIS_PRESETS: ThesisPreset[] = [
  {
    id: 'vertical-ai',
    name: 'Vertical AI',
    description: 'Industry-specific AI applications with deep domain moats',
    weights: {
      'Vertical AI': 10,
      'Enterprise AI': 7,
      'Cybersecurity AI': 8,
      'AI Applications': 5,
      'Automation': 4,
    },
    layerPreference: ['Application'],
  },
  {
    id: 'robotics',
    name: 'Robotics & Physical AI',
    description: 'Companies building autonomous systems and physical world AI',
    weights: {
      'Robotics': 10,
      'Infrastructure': 5,
      'Frontier Models': 4,
    },
    layerPreference: ['Application', 'Hardware'],
  },
  {
    id: 'defense',
    name: 'Defense & Dual-Use',
    description: 'AI for national security, intelligence, and defense applications',
    weights: {
      'Vertical AI': 6,
      'Cybersecurity AI': 9,
      'Robotics': 8,
      'Infrastructure': 5,
    },
  },
  {
    id: 'healthcare',
    name: 'Healthcare AI',
    description: 'AI for clinical care, drug discovery, and health operations',
    weights: {
      'Vertical AI': 10,
    },
  },
  {
    id: 'infrastructure',
    name: 'AI Infrastructure',
    description: 'Core compute, data, and platform layers powering AI',
    weights: {
      'Infrastructure': 10,
      'Data & MLOps': 9,
      'Agent Frameworks': 6,
      'Developer Tools': 5,
    },
    layerPreference: ['Hardware', 'Cloud', 'Platform', 'Foundation'],
  },
  {
    id: 'frontier',
    name: 'Frontier Models',
    description: 'Companies pushing the boundary of AI capabilities',
    weights: {
      'Frontier Models': 10,
      'Infrastructure': 6,
    },
    layerPreference: ['Foundation'],
  },
  {
    id: 'devtools',
    name: 'Developer Tools',
    description: 'Tools and platforms for AI-powered software development',
    weights: {
      'Developer Tools': 10,
      'Agent Frameworks': 7,
      'Data & MLOps': 5,
    },
    layerPreference: ['DevTools', 'Middleware', 'Platform'],
  },
];

export function scoreCompanyForThesis(
  company: Company,
  thesis: ThesisPreset,
  customWeights?: Record<string, number>
): number {
  const weights = customWeights || thesis.weights;
  let score = 0;
  let maxPossible = 10;

  // Category weight (0-10)
  const categoryScore = weights[company.category] || 0;
  score += categoryScore * 0.5;

  // Layer preference bonus
  if (thesis.layerPreference?.includes(company.layer)) {
    score += 2;
  }

  // Geo preference bonus
  if (thesis.geoPreference?.includes(company.geography)) {
    score += 1;
  }

  // Strategic importance bonus
  if (company.strategic_importance_score) {
    score += (company.strategic_importance_score / 10) * 2;
  }

  // Normalize to 0-10
  return Math.min(10, Math.round(score * 10) / 10);
}

export function rankCompaniesForThesis(
  companies: Company[],
  thesis: ThesisPreset,
  customWeights?: Record<string, number>
): (Company & { thesisScore: number })[] {
  return companies
    .map(c => ({
      ...c,
      thesisScore: scoreCompanyForThesis(c, thesis, customWeights),
    }))
    .filter(c => c.thesisScore > 0)
    .sort((a, b) => b.thesisScore - a.thesisScore);
}

export function getSubcategoryBreakdown(companies: Company[], category: string): Record<string, number> {
  const counts: Record<string, number> = {};
  companies
    .filter(c => c.category === category && c.subcategory)
    .forEach(c => {
      counts[c.subcategory!] = (counts[c.subcategory!] || 0) + 1;
    });
  return counts;
}
