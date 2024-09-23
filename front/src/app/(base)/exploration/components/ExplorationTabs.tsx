import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import {
  ClipsIcon,
  HomeIcon,
  RecordingIcon,
  SoundEventIcon,
} from "@/lib/components/icons";
import SectionTabs from "@/lib/components/navigation/SectionTabs";
import Tab from "@/lib/components/ui/Tab";

export default function ExplorationTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <SectionTabs
      title="Explore"
      tabs={[
        <Tab
          key={"home"}
          active={selectedLayoutSegment === null}
          onClick={() => {
            router.push(`/exploration/?${params.toString()}`);
          }}
        >
          <HomeIcon className="w-4 h-4 align-middle" />
          Home
        </Tab>,
        <Tab
          key={"recordings"}
          active={selectedLayoutSegment === "recordings"}
          onClick={() => {
            router.push(
              `/exploration/recordings/gallery/?${params.toString()}`,
            );
          }}
        >
          <RecordingIcon className="w-4 h-4 align-middle" />
          Recordings
        </Tab>,
        <Tab
          key={"clips"}
          active={selectedLayoutSegment === "clips"}
          onClick={() => {
            router.push(`/exploration/clips/gallery/?${params.toString()}`);
          }}
        >
          <ClipsIcon className="w-4 h-4 align-middle" />
          Clips
        </Tab>,
        <Tab
          key={"soundevents"}
          active={selectedLayoutSegment === "sound_events"}
          onClick={() => {
            router.push(
              `/exploration/sound_events/gallery/?${params.toString()}`,
            );
          }}
        >
          <SoundEventIcon className="w-4 h-4 align-middle" />
          Sound Events
        </Tab>,
      ]}
    />
  );
}
