import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type User = z.infer<typeof schemas.UserSchema>;

export type Login = z.input<typeof schemas.LoginSchema>;

export type UserCreate = z.input<typeof schemas.UserCreateSchema>;

export type UserUpdate = z.input<typeof schemas.UserUpdateSchema>;

export type PasswordUpdate = z.input<typeof schemas.PasswordUpdateSchema>;
