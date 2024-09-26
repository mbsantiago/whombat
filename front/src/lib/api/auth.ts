import { AxiosInstance } from "axios";

import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  register: "/api/v1/auth/register",
};

export function registerAuthAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function login(data: types.Login) {
    return await instance.post(
      endpoints.login,
      schemas.LoginSchema.parse(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
  }

  async function logout() {
    return await instance.post(endpoints.logout);
  }

  async function register(data: types.UserCreate): Promise<types.User> {
    let body = schemas.UserCreateSchema.parse(data);
    let response = await instance.post(endpoints.register, body);
    return schemas.UserSchema.parse(response.data);
  }

  return { login, logout, register } as const;
}
