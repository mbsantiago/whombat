import useStore from "@/app/store";

import useAudioSettingsBase from "@/lib/hooks/settings/useAudioSettings";

export default function useAudioSettings() {
  const initialSettings = useStore((state) => state.audioSettings);
  return useAudioSettingsBase({ initialSettings });
}
