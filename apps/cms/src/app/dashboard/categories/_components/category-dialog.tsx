"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ControllerRenderProps } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryEntity } from "@/domain/entities/category.entity";
import { createCategoryAction, updateCategoryAction } from "../actions";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  slug: z
    .string()
    .min(2, "Slug phải có ít nhất 2 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
    ),
  description: z.string().optional(),
  image: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0, "Thứ tự phải >= 0").default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryEntity;
  onSuccess?: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  // Reset form when category changes or dialog opens
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        image: "",
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [category, open, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        const result = await updateCategoryAction(category.id, {
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          image: data.image || undefined,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        });

        if (result.success) {
          toast.success("Cập nhật danh mục thành công");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const result = await createCategoryAction({
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          image: data.image || undefined,
          sortOrder: data.sortOrder,
          isActive: data.isActive,
        });

        if (result.success) {
          toast.success("Thêm danh mục thành công");
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    if (!category) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CategoryFormData, "name">;
              }) => (
                <FormItem>
                  <FormLabel>Tên danh mục *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                      placeholder="Ví dụ: Đồ ăn sáng"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CategoryFormData, "slug">;
              }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="do-an-sang"
                      disabled={!!category}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CategoryFormData, "description">;
              }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mô tả danh mục"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CategoryFormData, "image">;
              }) => (
                <FormItem>
                  <FormLabel>URL hình ảnh</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/image.jpg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CategoryFormData, "sortOrder">;
              }) => (
                <FormItem>
                  <FormLabel>Thứ tự hiển thị</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CategoryFormData, "isActive">;
              }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Kích hoạt</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {category ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
