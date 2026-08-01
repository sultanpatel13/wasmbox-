interface SkeletonProps {
  width?: string;
  height?: string;
  count?: number;
}

/** Simple shimmering placeholder block, used while data is loading. */
export function Skeleton({ width = "100%", height = "16px", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width, height }} />
      ))}
    </>
  );
}

/** Pre-built skeleton for a Card (matches the Dashboard stat cards). */
export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton width="60%" height="12px" />
      <div style={{ marginTop: 10 }}>
        <Skeleton width="40%" height="28px" />
      </div>
    </div>
  );
}

/** Pre-built skeleton for a table row. */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="table-row">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height="14px" />
      ))}
    </div>
  );
}
