import Input from "./Input";
import InputLabel from "./InputLabel";

export default function InputGroup({
  label,
  name,
  register,
  errors,
  type = "text",
}: {
  label?: string;
  name: string;
  register: any;
  errors: any;
  type?: string;
}) {
  return (
    <div className="mb-3">
      {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
      <Input
        type={type}
        {...register(name)}
        className={
          errors ? "outline outline-red-500 focus:outline-red-500" : null
        }
      />
      {errors?.message && (
        <p className="text-xs italic text-red-500 mt-2">{errors.message}</p>
      )}
    </div>
  );
}
