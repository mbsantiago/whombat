import { AxiosInstance } from "axios";
import { z } from "zod";

import { UserSchema } from "@/lib/schemas";

import type { User } from "@/lib/types";

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

export type UserCreate = z.input<typeof UserCreateSchema>;

export const UserUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  password: z.string().optional(),
});

export type UserUpdate = z.input<typeof UserUpdateSchema>;

export const PasswordUpdateSchema = z
  .object({
    old_password: z.string(),
    new_password: z.string(),
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: "New password must be different from old password",
  });

export type PasswordUpdate = z.input<typeof PasswordUpdateSchema>;

const DEFAULT_ENDPOINTS = {
  me: "/api/v1/users/me",
  update: "/api/v1/users/me",
  first: "/api/v1/users/first/",
};

export function registerUserAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getActiveUser(): Promise<User> {
    let response = await instance.get<User>(endpoints.me);
    return UserSchema.parse(response.data);
  }

  async function updateActiveUser(data: UserUpdate): Promise<User> {
    let body = UserUpdateSchema.parse(data);
    let response = await instance.patch<User>(endpoints.update, body);
    return UserSchema.parse(response.data);
  }

  async function createFirstUser(data: UserCreate): Promise<User> {
    let body = UserCreateSchema.parse(data);
    let response = await instance.post<User>(endpoints.first, body);
    return UserSchema.parse(response.data);
  }

  return {
    me: getActiveUser,
    update: updateActiveUser,
    first: createFirstUser,
  } as const;
}
