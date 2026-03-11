"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "../button";

interface DataTableColumnHeaderProps {
  label: string;
  sortable?: boolean;
  onSort?: () => void;
}

export function DataTableColumnHeader({
  label,
  sortable,
  onSort,
}: DataTableColumnHeaderProps) {
  if (!sortable) {
    return <span className="font-medium">{label}</span>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 font-medium"
      onClick={onSort}
    >
      {label}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );
}
