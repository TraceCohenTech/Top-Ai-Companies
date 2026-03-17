'use client';

import { MatrixCell } from '@/types';

interface Props {
  data: MatrixCell[];
}

export function HeatmapChart({ data }: Props) {
  const categories = [...new Set(data.map(d => d.category))].sort();
  const layers = [...new Set(data.map(d => d.layer))];

  const layerOrder = ['Foundation', 'Hardware', 'Cloud', 'Platform', 'Middleware', 'DevTools', 'Application'];
  layers.sort((a, b) => layerOrder.indexOf(a) - layerOrder.indexOf(b));

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getCount = (cat: string, layer: string) => {
    const cell = data.find(d => d.category === cat && d.layer === layer);
    return cell?.count || 0;
  };

  const getOpacity = (count: number) => {
    if (count === 0) return 0.02;
    return 0.15 + (count / maxCount) * 0.85;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${layers.length}, 1fr)` }}>
          {/* Header */}
          <div className="p-2" />
          {layers.map(layer => (
            <div key={layer} className="p-2 text-xs font-medium text-zinc-400 text-center">
              {layer}
            </div>
          ))}

          {/* Rows */}
          {categories.map(category => (
            <>
              <div key={`label-${category}`} className="p-2 text-xs font-medium text-zinc-300 flex items-center">
                {category}
              </div>
              {layers.map(layer => {
                const count = getCount(category, layer);
                return (
                  <div key={`${category}-${layer}`} className="p-1">
                    <div
                      className="rounded-md h-10 flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-default"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${getOpacity(count)})`,
                        color: count > 0 ? '#e4e4e7' : 'transparent',
                      }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
