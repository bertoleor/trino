import { Skeleton, ProductCardSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <Skeleton className="h-8 w-32" />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
