import { AxiosInstance } from "axios";

import * as schemas from "@/lib/schemas";
import type * as types from "@/lib/types";

const DEFAULT_ENDPOINTS = {
  me: "/api/v1/users/me",
  update: "/api/v1/users/me",
  first: "/api/v1/users/first/",
};

export function registerUserAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS,
) {
  async function getActiveUser(): Promise<types.User> {
    let response = await instance.get(endpoints.me);
    return schemas.UserSchema.parse(response.data);
  }

  async function updateActiveUser(data: types.UserUpdate): Promise<types.User> {
    let body = schemas.UserUpdateSchema.parse(data);
    let response = await instance.patch(endpoints.update, body);
    return schemas.UserSchema.parse(response.data);
  }

  async function createFirstUser(data: types.UserCreate): Promise<types.User> {
    let body = schemas.UserCreateSchema.parse(data);
    let response = await instance.post(endpoints.first, body);
    return schemas.UserSchema.parse(response.data);
  }

  return {
    me: getActiveUser,
    update: updateActiveUser,
    first: createFirstUser,
  } as const;
}
