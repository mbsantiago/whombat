import { z } from "zod";
import { AxiosInstance } from "axios";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const SimpleUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  name: z.string().nullable(),
});

export const UserUpdateSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export const PasswordUpdateSchema = z.object({
  old_password: z.string(),
  new_password: z.string(),
});

export type PasswordUpdate = z.infer<typeof PasswordUpdateSchema>;

export type SimpleUser = z.infer<typeof SimpleUserSchema>;

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
  };
}
