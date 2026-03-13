"use client";

import { Button } from "@/components/ui/button";

const TYPE_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Nạp tiền", value: "TOP_UP" },
  { label: "Mua hàng", value: "PURCHASE" },
  { label: "Hoàn tiền", value: "REFUND" },
  { label: "Điều chỉnh", value: "ADJUSTMENT" },
];

interface TransactionFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function TransactionFilters({
  selectedType,
  onTypeChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b scrollbar-hide">
      {TYPE_FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedType === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange(filter.value)}
          className="whitespace-nowrap"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
