import { NoIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";

export default function NotFound({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="mb-4 stroke-rose-500">
        <NoIcon
          className="inline-block ms-2 stroke-inherit"
          width={256}
          height={256}
        />
      </div>
      <p className="mb-4 text-3xl">Page Not Found</p>
      <p>Sorry, we could not find the page you were looking for.</p>
      <div className="mb-4">
        <Button mode="text" onClick={onGoHome}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
