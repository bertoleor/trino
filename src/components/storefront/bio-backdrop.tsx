export function BioBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="bg-lemon pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(var(--ink) 1.2px, transparent 1.2px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="border-ink shadow-pop bg-pink absolute -top-8 -right-10 block size-32 rounded-full border-[3px] md:-top-10 md:size-64" />
        <span className="border-ink shadow-pop bg-cobalt absolute top-28 -right-4 block size-14 rounded-full border-[3px] md:top-64 md:-right-6 md:size-36" />
        <span className="border-ink shadow-pop bg-aqua absolute top-[420px] -left-10 block size-24 rounded-full border-[3px] md:top-28 md:size-44" />
        <span className="border-ink shadow-pop-lg bg-lilac absolute bottom-28 -left-8 hidden size-36 rotate-12 border-[3px] md:block" />
        <span className="border-ink shadow-pop bg-orange absolute -right-8 bottom-12 hidden size-36 rounded-full border-[3px] md:block" />
      </div>
    </>
  );
}
