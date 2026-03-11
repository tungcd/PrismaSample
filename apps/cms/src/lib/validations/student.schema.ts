import { z } from "zod";

export const studentSchema = z.object({
  name: z
    .string()
    .min(2, "Tên học sinh phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  grade: z
    .string()
    .min(1, "Lớp là bắt buộc")
    .max(20, "Lớp không được quá 20 ký tự"),
  school: z
    .string()
    .min(2, "Tên trường phải có ít nhất 2 ký tự")
    .max(200, "Tên trường không được quá 200 ký tự"),
  cardNumber: z
    .string()
    .min(4, "Số thẻ phải có ít nhất 4 ký tự")
    .max(20, "Số thẻ không được quá 20 ký tự")
    .regex(/^[A-Z0-9]+$/, "Số thẻ chỉ được chứa chữ in hoa và số"),
  parentId: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val);
      if (isNaN(parsed)) throw new Error("Phụ huynh không hợp lệ");
      return parsed;
    }
    return val;
  }),
});

export type StudentInput = z.infer<typeof studentSchema>;
