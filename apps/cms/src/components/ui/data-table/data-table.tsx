"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import { Button } from "../button";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import type {
  PaginatedResult,
  DataTableConfig,
  DataTableColumn,
} from "@/types/data-table.types";

interface DataTableProps<T extends { id: string | number }> {
  result: PaginatedResult<T>;
  config: DataTableConfig<T>;
}

export function DataTable<T extends { id: string | number }>({
  result,
  config,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState(result.data);
  const [loading, setLoading] = useState<string | number | null>(null);

  // Local state for debounced filters
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize text filters from URL (only once on mount)
  useEffect(() => {
    const filters: Record<string, string> = {};
    config.columns.forEach((col) => {
      if (col.filterable && col.filter?.type === "text") {
        filters[col.key] = searchParams.get(col.key) || "";
      }
    });
    setTextFilters(filters);
    setIsInitialized(true);
  }, []); // Empty dependency - only run once on mount

  // Debounce text filter changes (skip on initial render)
  useEffect(() => {
    if (!isInitialized) return; // Skip on initial render

    const debouncedColumns = config.columns.filter(
      (col) =>
        col.filterable &&
        col.filter?.type === "text" &&
        col.filter?.debounce !== false,
    );

    if (debouncedColumns.length === 0) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      debouncedColumns.forEach((col) => {
        const value = textFilters[col.key];
        if (value && value !== "") {
          params.set(col.key, value);
        } else {
          params.delete(col.key);
        }
      });

      params.set("page", "1"); // Reset to page 1 only when filter changes

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [textFilters, isInitialized]); // Only trigger when textFilters change (not searchParams)

  // Update data when result changes
  useEffect(() => {
    setData(result.data);
  }, [result.data]);

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });

    // Scroll to top when changing pages
    if (updates.page) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectFilterChange = (key: string, value: string) => {
    updateURL({ [key]: value, page: "1" });
  };

  const handleSort = (columnKey: string) => {
    const currentSort = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder");
    const newOrder =
      currentSort === columnKey && currentOrder === "asc" ? "desc" : "asc";
    updateURL({ sortBy: columnKey, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: String(newPage) });
  };

  const handlePageSizeChange = (newSize: string) => {
    updateURL({ pageSize: newSize, page: "1" });
  };

  const handleRowAction = async (
    action: (item: T) => void | Promise<void>,
    item: T,
  ) => {
    setLoading(item.id);
    try {
      await action(item);
    } finally {
      setLoading(null);
    }
  };

  // Check if table has any filterable columns
  const hasFilterableColumns = () => {
    return config.columns.some((col) => col.filterable);
  };

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return config.columns.some((col) => {
      if (!col.filterable) return false;
      const value = searchParams.get(col.key);
      return value && value !== "" && value !== "all";
    });
  };

  // Clear all filters, keep sort and pagination
  const handleClearFilters = () => {
    const params = new URLSearchParams();

    // Keep sort and pagination
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    if (page) params.set("page", page);
    if (pageSize) params.set("pageSize", pageSize);

    // Clear text filters state
    const emptyFilters: Record<string, string> = {};
    config.columns.forEach((col) => {
      if (col.filterable && col.filter?.type === "text") {
        emptyFilters[col.key] = "";
      }
    });
    setTextFilters(emptyFilters);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const renderFilter = (column: DataTableColumn<T>) => {
    if (!column.filterable || !column.filter) {
      return null;
    }

    if (column.filter.type === "text") {
      return (
        <Input
          placeholder={column.filter.placeholder || `Tìm ${column.label}...`}
          value={textFilters[column.key] || ""}
          onChange={(e) =>
            setTextFilters((prev) => ({
              ...prev,
              [column.key]: e.target.value,
            }))
          }
          className="h-8"
        />
      );
    }

    if (column.filter.type === "select" && column.filter.options) {
      return (
        <Select
          value={searchParams.get(column.key) || "all"}
          onValueChange={(value) => handleSelectFilterChange(column.key, value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue
              placeholder={column.filter.placeholder || column.label}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {column.filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return null;
  };

  const renderCell = (column: DataTableColumn<T>, item: T) => {
    if (column.render) {
      return column.render(item);
    }
    return (item as any)[column.key] || "-";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Hiển thị {data.length} / {result.total}
            {config.entityName ? ` ${config.entityName}` : ""} (trang{" "}
            {result.page}/{result.totalPages})
          </p>
        </div>
        {config.onAdd && (
          <Button onClick={config.onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {config.addButtonLabel || "Thêm mới"}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  <DataTableColumnHeader
                    label={column.label}
                    sortable={column.sortable}
                    onSort={() => handleSort(column.key)}
                  />
                </TableHead>
              ))}
              {(config.rowActions && config.rowActions.length > 0) ||
              hasFilterableColumns() ? (
                <TableHead className="text-right">
                  {config.rowActions && config.rowActions.length > 0
                    ? "Thao tác"
                    : ""}
                </TableHead>
              ) : null}
            </TableRow>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={`filter-${column.key}`}>
                  {renderFilter(column)}
                </TableHead>
              ))}
              {(config.rowActions && config.rowActions.length > 0) ||
              hasFilterableColumns() ? (
                <TableHead className="text-right">
                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-8 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Xóa bộ lọc
                    </Button>
                  )}
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    config.columns.length +
                    (config.rowActions && config.rowActions.length > 0
                      ? 1
                      : hasFilterableColumns()
                        ? 1
                        : 0)
                  }
                  className="text-center py-8"
                >
                  {config.emptyMessage || "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  {config.columns.map((column) => (
                    <TableCell
                      key={`${item.id}-${column.key}`}
                      className={column.className}
                    >
                      {renderCell(column, item)}
                    </TableCell>
                  ))}
                  {(config.rowActions && config.rowActions.length > 0) ||
                  hasFilterableColumns() ? (
                    <TableCell className="text-right">
                      {config.rowActions && config.rowActions.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={loading === item.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {config.rowActions.map((action, index) => (
                              <div key={index}>
                                {action.separator && <DropdownMenuSeparator />}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRowAction(action.onClick, item)
                                  }
                                  className={
                                    action.variant === "destructive"
                                      ? "text-red-600"
                                      : ""
                                  }
                                >
                                  {action.icon && (
                                    <span className="mr-2">{action.icon}</span>
                                  )}
                                  {action.label}
                                </DropdownMenuItem>
                              </div>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
