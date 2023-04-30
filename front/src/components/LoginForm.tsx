import { useForm } from "react-hook-form";
import * as api from "../api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "./Input";
import InputGroup from "./InputGroup";

const schema = z.object({
  username: z.string().email(),
  password: z.string().min(8),
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
    api.login(data.username, data.password).then((response) => {
      console.log(response);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <InputGroup 
          label="Email"
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
  );
}
