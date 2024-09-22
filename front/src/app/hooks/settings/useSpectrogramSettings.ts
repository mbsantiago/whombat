import useStore from "@/app/store";

import useSpectrogramSettingsBase from "@/lib/hooks/settings/useSpectrogramSettings";

export default function useSpectrogramSettings() {
  const initialSettings = useStore((state) => state.spectrogramSettings);
  return useSpectrogramSettingsBase({ initialSettings });
}
