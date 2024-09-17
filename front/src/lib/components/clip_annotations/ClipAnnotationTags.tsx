import { type ComponentProps } from "react";
import TagPanel from "../tags/TagPanel";

import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/Empty";

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
    <Empty padding="p-2">No tags currently registered in this clip.</Empty>
  );
}
