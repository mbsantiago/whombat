import { z } from "zod";
import { AxiosInstance } from "axios";

const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type Login = z.infer<typeof LoginSchema>;

const DEFAULT_ENDPOINTS = {
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
};

function registerAuthAPI(
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

  return { login, logout };
}

export { registerAuthAPI };
