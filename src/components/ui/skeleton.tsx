import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-none bg-[var(--cream)] opacity-70', className)}
      {...props}
    />
  );
}
export function ProductCardSkeleton() {
  return (
    <div className="rounded-none border-2 border-[var(--ink)] p-4">
      <Skeleton className="aspect-square w-full rounded-none" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}
