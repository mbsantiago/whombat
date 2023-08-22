import { z } from "zod";
import { AxiosInstance } from "axios";

const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
});

type User = z.infer<typeof UserSchema>;

const DEFAULT_ENDPOINTS = {
  me: "/users/me",
};

function registerUserAPI(
  instance: AxiosInstance,
  endpoints: typeof DEFAULT_ENDPOINTS = DEFAULT_ENDPOINTS
) {
  async function getActiveUser() {
    let response = await instance.get<User>(endpoints.me);
    return UserSchema.parse(response.data);
  }

  return { me: getActiveUser };
}

export { registerUserAPI, type User, UserSchema };
