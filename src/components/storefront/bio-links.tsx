import { ArrowUpRight, Camera, Music2, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';

export type BioLink = {
  id: 'instagram' | 'tiktok' | 'facebook';
  href: string;
  title: string;
  handle: string;
  detail: string;
  tag: string;
  tone: 'pink' | 'lilac' | 'cobalt';
};

const ICONS: Record<BioLink['id'], ReactNode> = {
  instagram: <Camera aria-hidden="true" />,
  tiktok: <Music2 aria-hidden="true" />,
  facebook: <UsersRound aria-hidden="true" />,
};

const TONES: Record<BioLink['tone'], string> = {
  pink: 'bg-pink text-ink',
  lilac: 'bg-lilac text-ink',
  cobalt: 'bg-cobalt text-cream',
};

export function BioLinks({ links }: { links: readonly BioLink[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`border-ink shadow-pop rounded-card active:shadow-pop-sm flex min-h-20 items-center gap-4 border-[3px] p-4 transition-transform active:translate-x-0.5 active:translate-y-0.5 ${TONES[link.tone]}`}
          >
            <span className="border-ink shadow-pop-sm bg-cream text-ink rounded-card flex size-12 shrink-0 items-center justify-center border-2">
              {ICONS[link.id]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-label flex flex-wrap items-center gap-2 text-lg leading-tight font-black uppercase">
                {link.title}
                <span className="border-ink bg-lemon text-ink rounded-control border-2 px-2 py-0.5 text-[10px] font-black">
                  {link.tag}
                </span>
              </span>
              <span className="font-body mt-1 block text-sm font-semibold">
                {link.handle} · {link.detail}
              </span>
            </span>
            <ArrowUpRight aria-hidden="true" className="shrink-0" />
          </a>
        </li>
      ))}
    </ul>
  );
}
