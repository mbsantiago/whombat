"use client";

import { useForm } from "react-hook-form";
import * as api from "../api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, InputGroup } from "./components";

const schema = z.object({
  username: z.string(),
  password: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    api.auth.login(data.username, data.password).then((response) => {
      console.log(response);
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
