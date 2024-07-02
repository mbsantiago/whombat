import Spinner from "@/lib/components/Spinner";

export default function Loading() {
  return (
    <div className="flex flex-row justify-center items-center w-full h-full">
      <Spinner />
    </div>
  );
}
