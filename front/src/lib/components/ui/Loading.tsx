import Spinner from "@/lib/components/ui/Spinner";

export default function Loading({
  text = "",
}: {
  text?: string;
} = {}) {
  return (
    <div className="flex flex-row justify-center items-center w-full h-full">
      <Spinner /> {text}
    </div>
  );
}
