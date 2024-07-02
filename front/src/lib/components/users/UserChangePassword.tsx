import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type { User } from "@/lib/types";
import useActiveUser from "@/lib/hooks/api/useActiveUser";
import { useForm } from "react-hook-form";
import { Input, InputGroup } from "@/lib/components/inputs/index";

const schema = z
  .object({
    password: z.string(),
    password2: z.string(),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

type FormData = z.infer<typeof schema>;

export default function UserChangePassword(props: { user: User }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const {
    update: { mutate: updateUser },
  } = useActiveUser({ user: props.user });

  const handleChangePassword = (data: FormData) => {
    updateUser({ password: data.password });
  };

  return (
    <form onSubmit={handleSubmit(handleChangePassword)}>
      <div className="mb-3">
        <InputGroup
          label="Password"
          name="password"
          error={errors.password?.message}
        >
          <Input type="password" {...register("password")} />
        </InputGroup>
      </div>
      <div className="mb-3">
        <InputGroup
          label="Confirm Password"
          name="password2"
          error={errors.password2?.message}
        >
          <Input type="password" {...register("password2")} />
        </InputGroup>
      </div>
      <div>
        <Input type="submit" value="Change" />
      </div>
    </form>
  );
}
