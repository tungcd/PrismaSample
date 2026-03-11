"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { InfiniteSelectBoxProps, SelectableEntity } from "./types";

export function InfiniteSelectBox<T extends SelectableEntity>({
  fetchFn,
  multiple = false,
  value,
  defaultValue,
  onChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  disabled = false,
  renderOption,
  pageSize = 20,
  fetchByIdFn,
  className,
  error,
}: InfiniteSelectBoxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<T[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<T[]>([]);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Normalize value to array for easier handling
  const selectedIds = React.useMemo(() => {
    const val = value ?? defaultValue;
    if (val === undefined) return [];
    return Array.isArray(val) ? val : [val];
  }, [value, defaultValue]);

  // Load initial data and handle default value
  React.useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch data when search changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setItems([]);
      loadData(1, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load selected items that might not be in current page
  React.useEffect(() => {
    if (selectedIds.length > 0) {
      loadSelectedItems();
    }
  }, [JSON.stringify(selectedIds)]);

  const loadInitialData = async () => {
    await loadData(1, "");
  };

  const loadData = async (pageNum: number, search: string) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await fetchFn(pageNum, search);

      setItems((prev) => {
        if (pageNum === 1) {
          return result.data;
        }
        // Avoid duplicates
        const newItems = result.data.filter(
          (item) => !prev.some((p) => p.id === item.id),
        );
        return [...prev, ...newItems];
      });

      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadSelectedItems = async () => {
    // Find items that are selected but not in current items
    const missingIds = selectedIds.filter(
      (id) => !items.some((item) => item.id === id),
    );

    if (missingIds.length === 0) {
      // All selected items are already loaded
      const selected = items.filter((item) => selectedIds.includes(item.id));
      setSelectedItems(selected);
      return;
    }

    // Fetch missing items
    if (fetchByIdFn) {
      try {
        const promises = missingIds.map((id) => fetchByIdFn(id));
        const results = await Promise.all(promises);
        const validResults = results.filter((r) => r !== null) as T[];

        // Add to items and selectedItems
        setItems((prev) => {
          const newItems = validResults.filter(
            (item) => !prev.some((p) => p.id === item.id),
          );
          return [...newItems, ...prev];
        });

        const allSelected = [...items, ...validResults].filter((item) =>
          selectedIds.includes(item.id),
        );
        setSelectedItems(allSelected);
      } catch (error) {
        console.error("Error loading selected items:", error);
      }
    } else {
      // Without fetchByIdFn, just use what we have
      const selected = items.filter((item) => selectedIds.includes(item.id));
      setSelectedItems(selected);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isNearBottom && hasMore && !isLoadingMore && !isLoading) {
      loadData(page + 1, searchQuery);
    }
  };

  const handleSelect = (item: T) => {
    if (multiple) {
      const newIds = selectedIds.includes(item.id)
        ? selectedIds.filter((id) => id !== item.id)
        : [...selectedIds, item.id];

      onChange?.(newIds.length > 0 ? newIds : undefined);
    } else {
      const newValue = selectedIds[0] === item.id ? undefined : item.id;
      onChange?.(newValue);
      setOpen(false);
    }
  };

  const handleRemove = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const newIds = selectedIds.filter((selectedId) => selectedId !== id);
      onChange?.(newIds.length > 0 ? newIds : undefined);
    } else {
      onChange?.(undefined);
    }
  };

  const getDisplayValue = () => {
    if (selectedItems.length === 0) return placeholder;

    if (multiple) {
      return `Đã chọn ${selectedItems.length} mục`;
    }

    return renderOption
      ? renderOption(selectedItems[0])
      : selectedItems[0].name;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              error && "border-red-500",
              !selectedItems.length && "text-muted-foreground",
            )}
          >
            <span className="truncate">{getDisplayValue()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command shouldFilter={false} className="max-h-[400px]">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList
              onScroll={handleScroll}
              ref={scrollRef}
              className="max-h-[300px] overflow-y-auto"
            >
              {isLoading && (
                <div className="py-6 text-center text-sm">Đang tải...</div>
              )}

              {!isLoading && items.length === 0 && (
                <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
              )}

              {!isLoading && items.length > 0 && (
                <CommandGroup>
                  {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id.toString()}
                        onSelect={() => handleSelect(item)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {renderOption ? renderOption(item) : item.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {isLoadingMore && (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  Đang tải thêm...
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  Đã hiển thị tất cả
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected items as badges for multiple mode */}
      {multiple && selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary" className="gap-1">
              {renderOption ? renderOption(item) : item.name}
              <button
                type="button"
                onClick={(e) => handleRemove(item.id, e)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
