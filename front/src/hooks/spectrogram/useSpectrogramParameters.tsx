import { useDebounce } from "react-use";

import useStore from "@/store";
import { type SpectrogramParameters } from "@/api/spectrograms";


export default function useSpectrogramParameters({
  parameters,
}: {
  parameters: SpectrogramParameters;
}) {
  const set = useStore((state) => state.setSpectrogramSettings);

  // Debounce changes to the global state.
  useDebounce(() => {
    set(parameters)
  }, 200, [parameters]);
}
