import { AxiosInstance } from "axios";
import { z } from "zod";

import { UserSchema } from "@/schemas";

import type { User } from "@/types";

export const UserUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
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
};

export function registerUserAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getActiveUser() {
    let response = await instance.get<User>(endpoints.me);
    return UserSchema.parse(response.data);
  }

  async function updateActiveUser(data: UserUpdate) {
    let body = UserUpdateSchema.parse(data);
    let response = await instance.patch<User>(endpoints.update, body);
    return UserSchema.parse(response.data);
  }

  return {
    me: getActiveUser,
    update: updateActiveUser,
  } as const;
}
