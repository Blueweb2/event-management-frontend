import type { ReactNode } from "react";
import Loading from "./Loading";

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  loading?: boolean;
}

export default function Table<T>({
  columns,
  data,
  emptyMessage = "No records found.",
  loading = false,
}: TableProps<T>) {
  return (
    <div
      className={[
        "w-full overflow-hidden",
        "rounded-2xl",
        "border border-[var(--border)]",
        "bg-[var(--cream)]",
        "shadow-sm",
      ].join(" ")}
    >
      {/* Horizontal scroll for mobile */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          {/* Table Header */}
          <thead
            className={[
              "border-b border-[var(--border)]",
              "bg-[var(--sage-light)]/60",
            ].join(" ")}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={[
                    "whitespace-nowrap",
                    "px-4 py-3.5",
                    "text-xs font-semibold uppercase tracking-wide",
                    "text-[var(--sage-dark)]",
                    column.className ?? "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody
            className={[
              "divide-y divide-[var(--border)]",
              "bg-[var(--cream)]",
            ].join(" ")}
          >
            {/* Loading */}
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loading size="md" />

                    <span className="text-sm text-[var(--taupe)]">
                      Loading...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              /* Empty State */
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                >
                  <span className="text-sm text-[var(--taupe)]">
                    {emptyMessage}
                  </span>
                </td>
              </tr>
            ) : (
              /* Data Rows */
              data.map((item, index) => (
                <tr
                  key={index}
                  className={[
                    "transition-colors duration-150",
                    "hover:bg-[var(--sage-light)]/40",
                  ].join(" ")}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={[
                        "px-4 py-3.5",
                        "text-[var(--foreground)]",
                        column.className ?? "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {column.render
                        ? column.render(item)
                        : String(
                            item[column.key as keyof T] ?? ""
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}