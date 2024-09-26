import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import * as icons from "@/lib/components/icons";
import SectionTabs from "@/lib/components/navigation/SectionTabs";
import Tab from "@/lib/components/ui/Tab";

export default function ExplorationTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <SectionTabs
      tabs={[
        <Tab
          key={"list"}
          active={selectedLayoutSegment === "list"}
          onClick={() => {
            router.push(`/exploration/recordings/list/?${params.toString()}`);
          }}
        >
          )
          <icons.ListIcon className="w-5 h-5 align-middle" />
          List
        </Tab>,
        <Tab
          key={"map"}
          active={selectedLayoutSegment === "map"}
          onClick={() => {
            router.push(`/exploration/recordings/map/?${params.toString()}`);
          }}
        >
          <icons.MapIcon className="w-5 h-5 align-middle" />
          Map
        </Tab>,
      ]}
    />
  );
}
