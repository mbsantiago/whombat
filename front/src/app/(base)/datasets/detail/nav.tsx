import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";

import Header from "@/components/Header";
import { H1 } from "@/components/Headings";
import { DatasetIcon, RecordingsIcon } from "@/components/icons";
import Tabs from "@/components/Tabs";

import type { Dataset } from "@/types";

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
export default function DatasetNavHeader({ dataset }: { dataset: Dataset }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <Header>
      <div className="flex overflow-x-auto flex-row space-x-4 w-full">
        <H1>{dataset.name}</H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: selectedLayoutSegment === null,
              icon: <DatasetIcon className="w-4 h-4 align-middle" />,
              onClick: () => {
                router.push(`/datasets/detail/?${params.toString()}`);
              },
            },
            {
              id: "recordings",
              title: "Recordings",
              icon: <RecordingsIcon className="w-4 h-4 align-middle" />,
              isActive: selectedLayoutSegment === "recordings",
              onClick: () => {
                router.push(
                  `/datasets/detail/recordings/?${params.toString()}`,
                );
              },
            },
            // {
            //   id: "sound_events",
            //   title: "Sound Events",
            //   icon: <icons.SoundEventIcon className="w-4 h-4 align-middle" />,
            //   isActive: selectedLayoutSegment === "sound_events",
            //   onClick: () => {
            //     router.push(
            //       `/datasets/detail/sound_events/?${params.toString()}`,
            //     );
            //   },
            // },
            // {
            //   id: "notes",
            //   icon: <icons.NotesIcon className="w-4 h-4 align-middle" />,
            //   title: "Notes",
            //   isActive: selectedLayoutSegment === "notes",
            //   onClick: () => {
            //     router.push(`/datasets/detail/notes/?${params.toString()}`);
            //   },
            // },
          ]}
        />
      </div>
    </Header>
  );
}
