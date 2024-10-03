import { type ComponentProps } from "react";

import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/ui/Empty";

import TagPanel from "../tags/TagPanel";

export default function ClipAnnotationTags(
  props: Omit<ComponentProps<typeof TagPanel>, "title">,
) {
  return (
    <Card>
      <TagPanel title="Clip Tags" {...props} EmptyTags={<NoTags />} />
    </Card>
  );
}

function NoTags() {
  return (
    <Empty outerClassName="p-2">
      No tags currently registered in this clip.
    </Empty>
  );
}
