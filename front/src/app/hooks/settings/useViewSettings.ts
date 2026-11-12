import useStore from "@/app/store";
import useViewSettingsBase from "@/lib/hooks/settings/useViewSettings";

export default function useViewSettings() {
  const initialSettings = useStore((state) => state.viewSettings);
  return useViewSettingsBase({ initialSettings });
}
