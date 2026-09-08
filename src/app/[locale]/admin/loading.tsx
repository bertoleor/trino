import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <main aria-busy="true" aria-label="loading admin" className="mx-auto w-full max-w-3xl p-4">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
