"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input, InputGroup } from "@/components/inputs";
import api from "@/app/api";
import useStore from "@/app/store";

const schema = z.object({
  username: z.string(),
  password: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const login = useStore((state) => state.login);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const router = useRouter();

  const onSubmit = (data: FormData) => {
    api.auth
      .login(data)
      .catch(() => {
        reset();
        setError("username", { message: "Invalid username or password" });
        setError("password", { message: "Invalid username or password" });
        return Promise.reject("Invalid username or password");
      })
      .then(() => api.user.me())
      .then((user) => {
        login(user);
        router.push("/");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <InputGroup
            label="Username"
            name="username"
            register={register}
            errors={errors.username}
          />
        </div>
        <div className="mb-3">
          <InputGroup
            type="password"
            label="Password"
            name="password"
            register={register}
            errors={errors.password}
          />
        </div>
        <div>
          <Input type="submit" value="Submit" />
        </div>
      </form>
    </div>
  );
}
