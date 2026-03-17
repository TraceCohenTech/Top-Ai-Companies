import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-zinc-950/50 py-6 mt-auto">
      <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-xs text-zinc-500">
        <span>AI Landscape Intelligence Dashboard</span>
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/Trace_Cohen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Twitter
          </a>
          <a
            href="mailto:t@nyvp.com"
            className="hover:text-white transition-colors"
          >
            t@nyvp.com
          </a>
        </div>
      </div>
    </footer>
  );
}
