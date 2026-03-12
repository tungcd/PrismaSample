import { ReactNode } from "react";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type FilterType = "text" | "select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ColumnFilter {
  type: FilterType;
  placeholder?: string;
  options?: SelectOption[];
  debounce?: boolean; // Default: true for text, false for select
}

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface RowAction<T> {
  label: string | ((item: T) => string);
  icon?: ReactNode | ((item: T) => ReactNode);
  onClick: (item: T) => void | Promise<void>;
  variant?:
    | "default"
    | "destructive"
    | ((item: T) => "default" | "destructive");
  separator?: boolean; // Add separator before this action
}

export interface DataTableConfig<T> {
  columns: DataTableColumn<T>[];
  rowActions?: RowAction<T>[];
  onAdd?: () => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  entityName?: string; // For display messages like "Hiển thị 10 / 53 người dùng"
}
