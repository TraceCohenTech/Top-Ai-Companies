'use client';

import { Insight } from '@/types';
import { Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  insights: Insight[];
}

const severityStyles = {
  info: { bg: 'bg-zinc-800/50', border: 'border-zinc-700/50', icon: Lightbulb, iconColor: 'text-zinc-400' },
  warning: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', icon: AlertTriangle, iconColor: 'text-amber-400' },
  highlight: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', icon: TrendingUp, iconColor: 'text-blue-400' },
};

export function InsightsPanel({ insights }: Props) {
  return (
    <div className="space-y-2">
      {insights.map((insight, i) => {
        const style = severityStyles[insight.severity];
        const Icon = style.icon;
        return (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg border ${style.bg} ${style.border} transition-all hover:border-white/[0.12]`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.iconColor}`} />
            <p className="text-sm text-zinc-300 leading-relaxed">{insight.text}</p>
          </div>
        );
      })}
    </div>
  );
}
