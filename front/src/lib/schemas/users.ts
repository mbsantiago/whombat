import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email().optional(),
  name: z.string().nullable().optional(),
});

export const UserCreateSchema = z
  .object({
    email: z.string().email(),
    username: z.string(),
    password: z.string(),
    password_confirm: z.string(),
    name: z.string(),
    is_superuser: z.boolean().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

export const UserUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  password: z.string().optional(),
});

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const PasswordUpdateSchema = z
  .object({
    old_password: z.string(),
    new_password: z.string(),
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: "New password must be different from old password",
  });
