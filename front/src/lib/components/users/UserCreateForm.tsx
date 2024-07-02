import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input, InputGroup } from "@/components/inputs/index";
import Button from "@/components/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import api from "@/app/api";
import type { User } from "@/lib/types";
import type { AxiosError } from "axios";
import { UserCreateSchema, type UserCreate } from "@/lib/api/user";

export default function UserCreateForm(props: {
  onCreate?: (user: Promise<User>) => void;
  onAuthenticationError?: (error: AxiosError) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserCreate>({
    resolver: zodResolver(UserCreateSchema),
    mode: "onChange",
  });

  const { mutateAsync: createUser } = useMutation<User, AxiosError, UserCreate>(
    {
      mutationFn: api.user.first,
    },
  );

  const { onCreate, onAuthenticationError } = props;
  const onSubmit = useCallback(
    (data: UserCreate) => {
      const promise = createUser(data, {
        onError: (error) => {
          const { status } = error.response ?? {};
          switch (status) {
            case 401:
              onAuthenticationError?.(error);
              break;
            case 409:
              setError("email", {
                message: "Email already exists",
              });
              break;
            default:
              setError("username", {
                message: "Unknown error",
              });
              break;
          }
        },
      });
      onCreate?.(promise);
    },
    [setError, onAuthenticationError, createUser, onCreate],
  );

  return (
    <form className="flex flex-col gap-1" onSubmit={handleSubmit(onSubmit)}>
      <InputGroup
        label="Username"
        name="username"
        help="This name will be used to identify you in the app."
        error={errors.username?.message}
      >
        <Input {...register("username")} />
      </InputGroup>
      <InputGroup
        label="Name"
        name="name"
        error={errors.name?.message}
        help="Please provide your full name. This is especially helpful for sharing your annotations, ensuring correct attribution."
      >
        <Input {...register("name")} />
      </InputGroup>
      <InputGroup
        label="Email"
        name="email"
        error={errors.email?.message}
        help="Provide a valid email address. While not displayed in the app, it helps others contact you regarding annotated data."
      >
        <Input type="email" {...register("email")} />
      </InputGroup>
      <InputGroup
        label="Password"
        name="password"
        error={errors.password?.message}
        help="Create a strong password with at least 8 characters, including one number and one letter."
      >
        <Input type="password" {...register("password")} />
      </InputGroup>
      <InputGroup
        label="Confirm password"
        name="password_confirm"
        error={errors.password_confirm?.message}
        help="Enter the same password again."
      >
        <Input type="password" {...register("password_confirm")} />
      </InputGroup>
      <div className="flex flex-row justify-center">
        <Button type="submit" variant="primary">
          Create account
        </Button>
      </div>
    </form>
  );
}
