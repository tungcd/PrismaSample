"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentEntity } from "@/domain/entities/student.entity";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfiniteSelectBox } from "@/components/ui/infinite-select-box";
import {
  getParentsForSelect,
  getParentById,
  ParentSelectEntity,
} from "@/app/actions/get-parents.action";
import {
  getAllSchools,
  SchoolSelectEntity,
} from "@/app/actions/get-schools.action";
import { createStudentAction, updateStudentAction } from "../actions";
import { toast } from "sonner";
import {
  studentSchema,
  type StudentInput,
} from "@/lib/validations/student.schema";
import { useState } from "react";

// Grade options (6A - 12D)
export const GRADES = [
  "6A",
  "6B",
  "6C",
  "6D",
  "7A",
  "7B",
  "7C",
  "7D",
  "8A",
  "8B",
  "8C",
  "8D",
  "9A",
  "9B",
  "9C",
  "9D",
  "10A",
  "10B",
  "10C",
  "10D",
  "11A",
  "11B",
  "11C",
  "11D",
  "12A",
  "12B",
  "12C",
  "12D",
];

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentEntity | null;
  onSuccess: (student: StudentEntity) => void;
}

export function StudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: StudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<SchoolSelectEntity[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      grade: "",
      school: "",
      cardNumber: "",
      avatar: "",
      parentId: 0,
    },
  });

  useEffect(() => {
    // Fetch schools when dialog opens
    if (open) {
      getAllSchools().then(setSchools).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name,
        grade: student.grade,
        school: student.school,
        cardNumber: student.cardNumber || "",
        avatar: student.avatar || "",
        parentId: student.parentId,
      });
    } else {
      form.reset({
        name: "",
        grade: "",
        school: "",
        cardNumber: "",
        avatar: "",
        parentId: 0,
      });
    }
  }, [student, open, form]);

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Chỉ chấp nhận file JPG hoặc PNG");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Kích thước file phải < 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      form.setValue("avatar", base64);
    };
    reader.onerror = () => {
      setUploadError("Không thể đọc file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    form.setValue("avatar", "");
    setUploadError("");
  };

  const onSubmit = async (data: StudentInput) => {
    setLoading(true);

    try {
      if (student) {
        const result = await updateStudentAction(student.id, data);
        if (result.success && result.data) {
          toast.success("Cập nhật học sinh thành công");
          onSuccess(result.data);
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } else {
        const result = await createStudentAction(data);
        if (result.success && result.data) {
          toast.success("Tạo học sinh thành công");
          onSuccess(result.data);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {student ? "Sửa học sinh" : "Thêm học sinh"}
            </DialogTitle>
            <DialogDescription>
              {student
                ? "Cập nhật thông tin học sinh"
                : "Tạo học sinh mới trong hệ thống"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên học sinh <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Nguyễn Văn A"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="grade">
                Lớp <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("grade")}
                onValueChange={(value) => form.setValue("grade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.grade && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.grade.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="school">
                Trường <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch("school")}
                onValueChange={(value) => form.setValue("school", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trường" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.name}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.school && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.school.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cardNumber">
                Số thẻ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cardNumber"
                {...form.register("cardNumber")}
                placeholder="SC001234"
              />
              {form.formState.errors.cardNumber && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cardNumber.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar">Ảnh đại diện</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleAvatarUpload}
                className="cursor-pointer"
              />
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
              {form.watch("avatar") && (
                <div className="mt-2 relative group w-32 h-32">
                  <img
                    src={form.watch("avatar")}
                    alt="Avatar preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parentId">
                Phụ huynh <span className="text-red-500">*</span>
              </Label>
              <InfiniteSelectBox<ParentSelectEntity>
                fetchFn={getParentsForSelect}
                fetchByIdFn={getParentById}
                value={form.watch("parentId")}
                onChange={(value) =>
                  form.setValue("parentId", Number(value) || 0)
                }
                placeholder="Chọn phụ huynh"
                searchPlaceholder="Tìm theo tên, email, số điện thoại..."
                renderOption={(parent) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{parent.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {parent.email}
                      {parent.phone && ` • ${parent.phone}`}
                    </span>
                  </div>
                )}
                error={form.formState.errors.parentId?.message}
              />
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
              {loading ? "Đang xử lý..." : student ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
