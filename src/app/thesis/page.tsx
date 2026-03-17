import { loadCompanies } from '@/lib/data';
import { THESIS_PRESETS } from '@/lib/scoring';
import { ThesisOverlay } from '@/components/thesis/thesis-overlay';

export default function ThesisPage() {
  const companies = loadCompanies();

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Thesis Overlay</h1>
        <p className="text-zinc-400 text-sm mt-1">Match companies against investment theses and score alignment</p>
      </div>

      <ThesisOverlay companies={companies} presets={THESIS_PRESETS} />
    </div>
  );
}
