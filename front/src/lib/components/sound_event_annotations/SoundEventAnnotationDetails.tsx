import {
  DescriptionData,
  DescriptionTerm,
} from "@/lib/components/ui/Description";
import { H4 } from "@/lib/components/ui/Headings";

import type { SoundEventAnnotation } from "@/lib/types";

export default function SoundEventAnnotationDetails({
  soundEventAnnotation,
}: {
  soundEventAnnotation: SoundEventAnnotation;
}) {
  return (
    <div className="flex flex-col gap-2">
      <H4 className="text-center">Sound Event Details</H4>
      <div className="flex flex-row flex-wrap gap-4">
        <div className="flex flex-col mr-4">
          <DescriptionTerm>Geometry Type</DescriptionTerm>
          <DescriptionData>
            {soundEventAnnotation.sound_event.geometry_type}
          </DescriptionData>
        </div>
        {soundEventAnnotation.sound_event.features?.map((feature) => (
          <div key={feature.name}>
            <DescriptionTerm>{feature.name}</DescriptionTerm>
            <DescriptionData>{feature.value.toLocaleString()}</DescriptionData>
          </div>
        ))}
      </div>
    </div>
  );
}
