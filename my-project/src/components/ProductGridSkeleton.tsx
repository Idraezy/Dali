interface ProductGridSkeletonProps {
  count?: number;
  // Grid classes matching the grid this stands in for.
  className?: string;
}

// Placeholder cards shown while products are still loading.
export default function ProductGridSkeleton({ count = 8, className = "" }: ProductGridSkeletonProps) {
  return (
    <div className={`grid ${className}`} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-[#001D23] rounded-xl overflow-hidden animate-pulse">
          <div className="h-64 bg-[#002a35]" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-[#002a35]" />
            <div className="h-4 w-1/3 rounded bg-[#002a35]" />
          </div>
        </div>
      ))}
    </div>
  );
}
