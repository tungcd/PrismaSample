"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/lib/hooks/use-cart";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useCreateOrder } from "@/lib/hooks/use-orders";
import { useStudents } from "@/lib/hooks/use-students";
import { vouchersApi } from "@/lib/api/vouchers.api";
import { ShoppingCart, Wallet, AlertCircle, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const createOrder = useCreateOrder();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [validatedVoucher, setValidatedVoucher] = useState<any>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // If student, auto-select self
      if (parsedUser.role === "STUDENT") {
        setSelectedStudentId(String(parsedUser.id));
      }
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleValidateVoucher = async () => {
    if (!cart || !voucherCode.trim()) return;

    setIsValidatingVoucher(true);
    try {
      const result = await vouchersApi.validate({
        code: voucherCode.trim(),
        orderAmount: cart.total,
      });

      if (result.valid) {
        setValidatedVoucher(result.voucher);
        setVoucherDiscount(result.discountAmount || 0);
        toast.success(result.message || "Mã giảm giá hợp lệ!");
      } else {
        setValidatedVoucher(null);
        setVoucherDiscount(0);
        toast.error(result.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error: any) {
      setValidatedVoucher(null);
      setVoucherDiscount(0);
      toast.error(error.message || "Không thể xác thực mã giảm giá");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setValidatedVoucher(null);
    setVoucherDiscount(0);
  };

  const subtotal = cart?.total || 0;
  const finalTotal = Math.max(0, subtotal - voucherDiscount);
  const balance = wallet?.balance || 0;
  const hasInsufficientBalance = finalTotal > balance;

  const handleCreateOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    if (user?.role === "PARENT" && !selectedStudentId) {
      toast.error("Vui lòng chọn học sinh");
      return;
    }

    if (hasInsufficientBalance) {
      toast.error("Số dư ví không đủ. Vui lòng nạp thêm tiền.");
      return;
    }

    try {
      const orderData: any = {
        useCart: true,
        notes: notes.trim() || undefined,
        voucherCode: validatedVoucher ? voucherCode.trim() : undefined,
      };

      // If parent, include studentId (convert string to number)
      if (user?.role === "PARENT") {
        orderData.studentId = parseInt(selectedStudentId, 10);
      }

      const order = await createOrder.mutateAsync(orderData);

      // Check if order needs approval
      if (order.needsApproval) {
        toast.success("Đơn hàng đã tạo và đang chờ phụ huynh duyệt!");
      } else {
        toast.success("Đặt hàng thành công!");
      }

      // Navigate to order detail
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo đơn hàng");
    }
  };

  if (!mounted || cartLoading || walletLoading) {
    return (
      <div className="container max-w-2xl py-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container max-w-2xl py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-lg text-gray-600 mb-4">Giỏ hàng trống</p>
        <Link href="/menu">
          <Button>Xem menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-4 pb-[20rem] space-y-4">
      <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>

      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Món đã chọn ({cart.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cart.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <div className="text-right font-medium">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Student Selection (if parent) */}
      {mounted && user?.role === "PARENT" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chọn học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
              disabled={studentsLoading || !students || students.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    studentsLoading
                      ? "Đang tải..."
                      : students && students.length > 0
                        ? "Chọn học sinh"
                        : "Chưa có học sinh nào"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {students &&
                  students.length > 0 &&
                  students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} - Lớp {student.grade}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng chọn học sinh để đặt món
            </p>
          </CardContent>
        </Card>
      )}

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ghi chú</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Thêm ghi chú cho đơn hàng (tùy chọn)"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNotes(e.target.value)
            }
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Mã giảm giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validatedVoucher ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-green-800">
                    {validatedVoucher.code}
                  </p>
                  <p className="text-sm text-green-600">
                    {validatedVoucher.description}
                  </p>
                  <p className="text-sm font-medium text-green-700 mt-1">
                    - {formatCurrency(voucherDiscount)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveVoucher}
                  className="text-green-700 hover:text-green-800"
                >
                  Bỏ
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã giảm giá"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleValidateVoucher}
                disabled={!voucherCode.trim() || isValidatingVoucher}
              >
                {isValidatingVoucher ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Áp dụng"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Balance Warning */}
      {hasInsufficientBalance && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Số dư ví không đủ</p>
                <p className="text-sm text-red-600 mt-1">
                  Số dư hiện tại: {formatCurrency(balance)}
                </p>
                <p className="text-sm text-red-600">
                  Cần thanh toán: {formatCurrency(finalTotal)}
                </p>
                <Link href="/wallet" className="inline-block mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300"
                  >
                    Nạp tiền
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky Bottom Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="container max-w-2xl p-4">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Wallet className="h-5 w-5 text-gray-500" />
                <div className="text-right">
                  <p className="text-sm text-gray-600">Số dư ví</p>
                  <p className="font-medium">{formatCurrency(balance)}</p>
                </div>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>- {formatCurrency(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleCreateOrder}
                disabled={
                  createOrder.isPending ||
                  hasInsufficientBalance ||
                  (user?.role === "PARENT" && !selectedStudentId)
                }
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  `Đặt hàng • ${formatCurrency(finalTotal)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
