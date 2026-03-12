"use client";

import { useState } from "react";
import { Eye, CheckCircle, XCircle, Trash2, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { DataTableConfig } from "@/types/data-table.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { GetTopUpsResult } from "@/application/use-cases/top-up/get-top-ups.use-case";
import { TopUpEntity } from "@/domain/entities/top-up.entity";
import { TopUpDetailDialog } from "./top-up-detail-dialog";
import { TopUpActionDialog } from "./top-up-action-dialog";
import { TopUpDialog } from "./top-up-dialog";
import { deleteTopUpAction } from "../actions";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils/date";

interface TopUpsTableProps {
  result: GetTopUpsResult;
}

export function TopUpsTable({ result }: TopUpsTableProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpEntity | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  const handleViewDetail = (topUp: TopUpEntity) => {
    setSelectedTopUp(topUp);
    setDetailDialogOpen(true);
  };

  const handleApprove = (topUp: TopUpEntity) => {
    setSelectedTopUp(topUp);
    setActionType("approve");
    setActionDialogOpen(true);
  };

  const handleReject = (topUp: TopUpEntity) => {
    setSelectedTopUp(topUp);
    setActionType("reject");
    setActionDialogOpen(true);
  };

  const handleDelete = async (topUp: TopUpEntity) => {
    // Only allow deleting PENDING requests
    if (topUp.status !== "PENDING") {
      toast.error("Chỉ có thể xóa yêu cầu đang chờ phê duyệt");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu nạp tiền này?")) {
      return;
    }

    const result = await deleteTopUpAction(topUp.id);
    if (result.success) {
      toast.success("Đã xóa yêu cầu nạp tiền");
    } else {
      toast.error(result.error || "Xóa yêu cầu nạp tiền thất bại");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
    };

    const labels: Record<string, string> = {
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const tableConfig: DataTableConfig<TopUpEntity> = {
    columns: [
      {
        key: "id",
        label: "ID",
        render: (topUp) => `#${topUp.id}`,
      },
      {
        key: "user",
        label: "Phụ huynh",
        filterable: true,
        render: (topUp) => (
          <div>
            <div className="font-medium">{topUp.user?.name}</div>
            <div className="text-sm text-muted-foreground">
              {topUp.user?.email}
            </div>
          </div>
        ),
        filter: {
          type: "text",
          placeholder: "Tìm theo ID phụ huynh",
        },
      },
      {
        key: "amount",
        label: "Số tiền",
        render: (topUp) => (
          <span className="font-semibold">{formatCurrency(topUp.amount)}</span>
        ),
      },
      {
        key: "status",
        label: "Trạng thái",
        filterable: true,
        render: (topUp) => getStatusBadge(topUp.status),
        filter: {
          type: "select",
          placeholder: "Lọc trạng thái",
          options: [
            { label: "Chờ duyệt", value: "PENDING" },
            { label: "Đã duyệt", value: "APPROVED" },
            { label: "Đã từ chối", value: "REJECTED" },
          ],
        },
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        render: (topUp) => (
          <span suppressHydrationWarning>
            {formatDateTime(topUp.createdAt)}
          </span>
        ),
      },
      {
        key: "processedAt",
        label: "Ngày xử lý",
        render: (topUp) => (
          <span suppressHydrationWarning>
            {topUp.processedAt ? formatDateTime(topUp.processedAt) : "-"}
          </span>
        ),
      },
      {
        key: "approver",
        label: "Người duyệt",
        filterable: true,
        render: (topUp) => topUp.approver?.name || "-",
        filter: {
          type: "text",
          placeholder: "Tìm theo ID người duyệt",
        },
      },
      {
        key: "actions",
        label: "Thao tác",
        render: (topUp) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleViewDetail(topUp)}>
                <Eye className="h-4 w-4 mr-2" />
                Chi tiết
              </DropdownMenuItem>

              {topUp.status === "PENDING" && (
                <>
                  <DropdownMenuItem onClick={() => handleApprove(topUp)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Phê duyệt
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleReject(topUp)}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => handleDelete(topUp)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    onAdd: () => setCreateDialogOpen(true),
    addButtonLabel: "Tạo yêu cầu nạp tiền",
  };

  return (
    <>
      <DataTable result={result} config={tableConfig} />

      <TopUpDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => window.location.reload()}
      />

      <TopUpDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        topUp={selectedTopUp}
      />

      <TopUpActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        topUp={selectedTopUp}
        actionType={actionType}
      />
    </>
  );
}
