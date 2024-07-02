import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import Header from "@/lib/components/Header";
import { H1 } from "@/lib/components/Headings";
import {
  ClipsIcon,
  HomeIcon,
  RecordingIcon,
  SoundEventIcon,
} from "@/lib/components/icons";
import Tabs from "@/lib/components/navigation/SectionTabs";

export default function ExplorationHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <Header>
      <div className="flex w-full flex-row space-x-4 overflow-x-auto">
        <H1>Explore</H1>
        <Tabs
          tabs={[
            {
              id: "home",
              title: "Home",
              isActive: selectedLayoutSegment === null,
              icon: <HomeIcon className="h-4 w-4 align-middle" />,
              onClick: () => {
                router.push(`/exploration/?${params.toString()}`);
              },
            },
            {
              id: "recordings",
              title: "Recordings",
              isActive: selectedLayoutSegment === "recordings",
              icon: <RecordingIcon className="h-4 w-4 align-middle" />,
              onClick: () => {
                router.push(`/exploration/recordings/?${params.toString()}`);
              },
            },
            {
              id: "clips",
              title: "Clips",
              icon: <ClipsIcon className="h-4 w-4 align-middle" />,
              isActive: selectedLayoutSegment === "clips",
              onClick: () => {
                router.push(`/exploration/clips/?${params.toString()}`);
              },
            },
            {
              id: "soundevents",
              title: "Sound Events",
              icon: <SoundEventIcon className="h-4 w-4 align-middle" />,
              isActive: selectedLayoutSegment === "sound_events",
              onClick: () => {
                router.push(`/exploration/sound_events/?${params.toString()}`);
              },
            },
          ]}
        />
      </div>
    </Header>
  );
}
