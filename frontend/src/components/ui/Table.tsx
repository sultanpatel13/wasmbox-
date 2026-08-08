import type { ReactNode } from "react";

export interface TableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  key: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Generic reusable table. Pass column definitions + data and it handles
 * the row rendering, matching the app's existing `.table` / `.table-row` styles.
 * Pass `onRowClick` to make rows clickable (e.g. to open a details modal).
 */
export function Table<T>({ columns, data, rowKey, emptyMessage = "No data", onRowClick }: TableProps<T>) {
  if (data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table">
      <div className="table-row table-head">
        {columns.map((col) => (
          <span key={col.key}>{col.header}</span>
        ))}
      </div>
      {data.map((row) => (
        <div
          className={`table-row ${onRowClick ? "table-row-clickable" : ""}`}
          key={rowKey(row)}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          role={onRowClick ? "button" : undefined}
          tabIndex={onRowClick ? 0 : undefined}
        >
          {columns.map((col) => (
            <span key={col.key}>{col.render(row)}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
