import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-row justify-center items-center">
      <Spinner />
    </div>
  );
}
