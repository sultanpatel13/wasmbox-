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
}

/**
 * Generic reusable table. Pass column definitions + data and it handles
 * the row rendering, matching the app's existing `.table` / `.table-row` styles.
 */
export function Table<T>({ columns, data, rowKey, emptyMessage = "No data" }: TableProps<T>) {
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
        <div className="table-row" key={rowKey(row)}>
          {columns.map((col) => (
            <span key={col.key}>{col.render(row)}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
