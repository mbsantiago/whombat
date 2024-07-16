"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import api from "@/app/api";
import { WhombatIcon } from "@/lib/components/icons";
import { Input, InputGroup } from "@/lib/components/inputs/index";
import Link from "@/lib/components/ui/Link";
import Info from "@/lib/components/ui/Info";

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
    <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
      <div className="mb-4 flex flex-col items-center gap-4 text-center text-7xl">
        <WhombatIcon width={128} height={128} />
        <span className="font-sans font-bold text-emerald-500 underline decoration-8">
          Whombat
        </span>
      </div>
      <p className="max-w-prose text-stone-500">
        Welcome back! Please sign in to continue.
      </p>
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
      <Info className="w-80">
        <p>
          Don&apos;t have an account? Ask your administrator to create one for
          you.
        </p>
      </Info>
      <Info className="w-80">
        <p>
          First time booting up Whombat? Click instead to create an account:
        </p>
        <div className="w-full flex flex-row justify-center">
          <Link mode="text" href="/first/" variant="info">
            Create account
          </Link>
        </div>
      </Info>
    </div>
  );
}
