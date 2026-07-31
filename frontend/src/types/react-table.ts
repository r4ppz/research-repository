import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- type params must match the original declaration for interface merging
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}

export {};
