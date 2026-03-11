"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProductEntity } from "@/domain/entities/product.entity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createProductAction, updateProductAction } from "../actions";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  slug: z
    .string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá phải >= 0"),
  stock: z.coerce.number().int().min(0, "Tồn kho phải >= 0"),
  categoryId: z.coerce.number().int().positive("Vui lòng chọn danh mục"),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductEntity | null;
  onSuccess: () => void;
  categoryOptions: { value: string; label: string }[];
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
  categoryOptions,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: 0,
      supplierId: null,
      isActive: true,
      isFeatured: false,
      images: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        supplierId: product.supplierId || null,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: product.images || [],
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        categoryId: 0,
        supplierId: null,
        isActive: true,
        isFeatured: false,
        images: [],
      });
    }
    setUploadError("");
  }, [product, open, form]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        price: data.price,
        stock: data.stock,
        images: data.images,
        categoryId: data.categoryId,
        supplierId: data.supplierId || undefined,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      };

      if (product) {
        const result = await updateProductAction(product.id, payload);
        if (result.success && result.data) {
          toast.success("Cập nhật sản phẩm thành công");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const result = await createProductAction(payload);
        if (result.success && result.data) {
          toast.success("Tạo sản phẩm thành công");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!product) {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Chỉ chấp nhận file JPG hoặc PNG");
      e.target.value = "";
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Kích thước file phải < 2MB");
      e.target.value = "";
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, base64]);
      e.target.value = "";
    };
    reader.onerror = () => {
      setUploadError("Lỗi khi đọc file");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((_: string, i: number) => i !== index),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Cập nhật thông tin sản phẩm"
              : "Điền thông tin sản phẩm mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                {...form.register("name")}
                onChange={handleNameChange}
                placeholder="Ví dụ: Cơm chiên hải sản"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="col-span-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="com-chien-hai-san"
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={3}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Giá (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="35000"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Tồn kho *</Label>
              <Input
                id="stock"
                type="number"
                {...form.register("stock")}
                placeholder="100"
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.stock.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="categoryId">Danh mục *</Label>
              <Select
                value={form.watch("categoryId")?.toString() || ""}
                onValueChange={(value) =>
                  form.setValue("categoryId", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <Label htmlFor="supplierId">Nhà cung cấp (tùy chọn)</Label>
              <Input
                id="supplierId"
                type="number"
                {...form.register("supplierId")}
                placeholder="ID nhà cung cấp"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-2">
              <Label htmlFor="images">Hình ảnh sản phẩm</Label>
              <Input
                id="images"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG • Tối đa 2MB
              </p>
              {uploadError && (
                <p className="text-sm text-red-600 mt-1">{uploadError}</p>
              )}

              {/* Image Preview */}
              {form.watch("images")?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.watch("images").map((img, index) => (
                    <div
                      key={index}
                      className="relative group w-24 h-24 border rounded overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("isActive", checked === true)
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Hoạt động
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={form.watch("isFeatured")}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue("isFeatured", checked === true)
                  }
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Nổi bật
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : product ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
