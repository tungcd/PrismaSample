"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    transactionFee: 0,
    minTopUpAmount: 10000,
    maxTopUpAmount: 5000000,
    canteenOpenTime: "06:00",
    canteenCloseTime: "18:00",
    maintenanceMode: false,
    systemNotice: "",
  });

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Cập nhật cài đặt hệ thống thành công");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt giao dịch</CardTitle>
          <CardDescription>
            Quản lý các thông số liên quan đến giao dịch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="transactionFee">Phí giao dịch (%)</Label>
            <Input
              id="transactionFee"
              type="number"
              value={settings.transactionFee}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  transactionFee: parseFloat(e.target.value),
                })
              }
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Phí được tính trên mỗi giao dịch (VD: 0.5%)
            </p>
          </div>

          <div>
            <Label htmlFor="minTopUpAmount">Số tiền nạp tối thiểu (VNĐ)</Label>
            <Input
              id="minTopUpAmount"
              type="number"
              value={settings.minTopUpAmount}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minTopUpAmount: parseInt(e.target.value),
                })
              }
              placeholder="10000"
            />
          </div>

          <div>
            <Label htmlFor="maxTopUpAmount">Số tiền nạp tối đa (VNĐ)</Label>
            <Input
              id="maxTopUpAmount"
              type="number"
              value={settings.maxTopUpAmount}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxTopUpAmount: parseInt(e.target.value),
                })
              }
              placeholder="5000000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Giờ hoạt động</CardTitle>
          <CardDescription>
            Cấu hình giờ mở cửa và đóng cửa căng tin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="canteenOpenTime">Giờ mở cửa</Label>
            <Input
              id="canteenOpenTime"
              type="time"
              value={settings.canteenOpenTime}
              onChange={(e) =>
                setSettings({ ...settings, canteenOpenTime: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="canteenCloseTime">Giờ đóng cửa</Label>
            <Input
              id="canteenCloseTime"
              type="time"
              value={settings.canteenCloseTime}
              onChange={(e) =>
                setSettings({ ...settings, canteenCloseTime: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hệ thống</CardTitle>
          <CardDescription>
            Cài đặt chung của hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked: boolean) =>
                setSettings({ ...settings, maintenanceMode: checked })
              }
            />
            <Label htmlFor="maintenanceMode" className="cursor-pointer">
              Chế độ bảo trì
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            Tạm ngưng hệ thống để bảo trì
          </p>

          <div>
            <Label htmlFor="systemNotice">Thông báo hệ thống</Label>
            <Textarea
              id="systemNotice"
              value={settings.systemNotice}
              onChange={(e) =>
                setSettings({ ...settings, systemNotice: e.target.value })
              }
              placeholder="Nhập thông báo hiển thị cho người dùng..."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Thông báo sẽ hiển thị trên tất cả các trang
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </div>
  );
}
