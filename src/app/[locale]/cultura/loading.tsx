import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <Skeleton className="h-8 w-32" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
