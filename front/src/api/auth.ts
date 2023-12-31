import { z } from "zod";
import { AxiosInstance } from "axios";

import { type User, UserSchema } from "@/api/user";

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type Login = z.infer<typeof LoginSchema>;

export const UserCreateSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
  name: z.string(),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

const DEFAULT_ENDPOINTS = {
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  register: "/api/v1/auth/register",
};

export function registerAuthAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function login(data: Login) {
    return await instance.post(endpoints.login, LoginSchema.parse(data), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  async function logout() {
    return await instance.post(endpoints.logout);
  }

  async function register(data: UserCreate) {
    let body = UserCreateSchema.parse(data);
    let response = await instance.post<User>(endpoints.register, body);
    return UserSchema.parse(response.data);
  }

  return { login, logout, register };
}
