"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { WhombatIcon } from "@/components/icons";
import { Input, InputGroup } from "@/components/inputs";
import api from "@/app/api";

const schema = z.object({
  username: z.string(),
  password: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const params = useSearchParams();

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
      .then(() => {
        const back = params.get("back");
        if (back) {
          router.push(back);
        } else {
          router.push("/");
        }
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-4">
        <WhombatIcon width={128} height={128} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <InputGroup
            label="Username"
            name="username"
            error={errors.username?.message}
          >
            <Input {...register("username")} />
          </InputGroup>
        </div>
        <div className="mb-3">
          <InputGroup
            label="Password"
            name="password"
            error={errors.password?.message}
          >
            <Input type="password" {...register("password")} />
          </InputGroup>
        </div>
        <div>
          <Input type="submit" value="Sign in" />
        </div>
      </form>
    </div>
  );
}
