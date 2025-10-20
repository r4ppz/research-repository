import clsx from "clsx";
import { Column } from "./column";
import style from "./Table.module.css";

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  emptyMessage?: string;
}

function Table<T>({ columns, data, keyExtractor, className, emptyMessage }: TableProps<T>) {
  return (
    <section className={clsx(style.tableSection, className)}>
      <table className={style.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} data-align={column.align ?? "center"}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={style.emptyState}>
                {emptyMessage ?? "No data available."}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((column) => (
                  <td key={column.key} data-align={column.align ?? "center"}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Table;
