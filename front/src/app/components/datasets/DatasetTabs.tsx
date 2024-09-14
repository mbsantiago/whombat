import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import { DatasetIcon, RecordingsIcon } from "@/lib/components/icons";
import SectionTabs from "@/lib/components/navigation/SectionTabs";
import Tab from "@/lib/components/ui/Tab";

import type { Dataset } from "@/lib/types";

/**
 * Navigation header component for the dataset pages.
 *
 * This component includes the dataset name as the main heading (H1) and a set
 * of tabs for navigating between different sections of the dataset (e.g.,
 * Overview, Recordings).
 *
 * @component
 * @param {Object} props - The component properties.
 * @param {Dataset} props.dataset - The dataset object to display information from.
 */
export default function DatasetTabs({ dataset }: { dataset: Dataset }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <SectionTabs
      title={dataset.name}
      tabs={[
        <Tab
          key="overview"
          active={selectedLayoutSegment === null}
          onClick={() => router.push(`/datasets/detail/?${params.toString()}`)}
        >
          <DatasetIcon className="w-4 h-4 align-middle" />
          Overview
        </Tab>,
        <Tab
          key="recordings"
          active={selectedLayoutSegment === "recordings"}
          onClick={() =>
            router.push(`/datasets/detail/recordings/?${params.toString()}`)
          }
        >
          <RecordingsIcon className="w-4 h-4 align-middle" />
          Recordings
        </Tab>,
      ]}
    />
  );
}
