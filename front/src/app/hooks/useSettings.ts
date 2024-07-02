import { useSearchParams } from "next/navigation";
import useStore from "@/app/store";

export default function useSettings() {
  const searchParams = useSearchParams();

  const audioSettings = useStore((state) => state.audioSettings);

}
