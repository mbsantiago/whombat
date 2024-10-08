import { type ComponentProps, useMemo, useState } from "react";

import {
  AddIcon,
  AscendingIcon,
  DescendingIcon,
  TagsIcon,
} from "@/lib/components/icons";
import ListSearch from "@/lib/components/lists/ListSearch";
import TagComponent from "@/lib/components/tags/Tag";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/ui/Empty";
import { H4 } from "@/lib/components/ui/Headings";
import Help from "@/lib/components/ui/Help";
import Loading from "@/lib/components/ui/Loading";

import useListWithSearch from "@/lib/hooks/lists/useListWithSearch";

import type * as types from "@/lib/types";
import { Color, getTagColor, getTagKey } from "@/lib/utils/tags";

const _emptyList: types.TagCount[] = [];

export default function ProjectTagsSummary({
  annotationProject,
  isLoading = false,
  clipTags = _emptyList,
  soundEventTags = _emptyList,
  onAddTags,
  ...props
}: {
  annotationProject: types.AnnotationProject;
  isLoading?: boolean;
  clipTags?: types.TagCount[];
  soundEventTags?: types.TagCount[];
  onAddTags?: () => void;
} & Omit<ComponentProps<typeof TagCounts>, "counts">) {
  const projectTags = useMemo(
    () => annotationProject.tags || [],
    [annotationProject.tags],
  );

  const counts = useMemo(
    () => getTagCount({ projectTags, clipTags, soundEventTags }),
    [clipTags, soundEventTags, projectTags],
  );

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H4 className="inline-flex items-center">
          <TagsIcon className="inline-block mr-2 w-5 h-5" />
          Project Tags
          <Help>
            Here you can see the tags used in the project and their respective
            frequencies. &quot;Clip Count&quot; represent the number of clips
            tagged with the tag, and &quot;Sound Event Count&quot; represent the
            number of sound events tagged with the tag. Click on a tag to see
            more details.
          </Help>
        </H4>
        <Button mode="text" variant="primary" onClick={onAddTags}>
          <AddIcon className="inline-block mr-2 w-5 h-5" /> Add Tags
        </Button>
      </div>
      {isLoading ? (
        <Loading />
      ) : projectTags.length === 0 ? (
        <NoTags />
      ) : (
        <TagCounts counts={counts} {...props} />
      )}
    </Card>
  );
}

function NoTags() {
  return (
    <Empty>
      No tags registered for this project. Add some tags to start annotating.
    </Empty>
  );
}

function TagCounts({
  counts,
  sortBy: initialSortBy = "clip",
  showMax: initialShowMax = 10,
  onClickTag,
  tagColorFn = getTagColor,
}: {
  counts: { tag: types.Tag; clipCount: number; soundEventCount: number }[];
  sortBy?: "clip" | "soundEvent" | "-clip" | "-soundEvent" | "tag" | "-tag";
  showMax?: number;
  onClickTag?: (tag: types.Tag) => void;
  tagColorFn?: (tag: types.Tag) => Color;
}) {
  const [sortBy, setSortBy] = useState(initialSortBy);

  const sortFn: (a: TagRow, b: TagRow) => number = useMemo(() => {
    switch (sortBy) {
      case "clip":
        return (a, b) => (a.clipCount < b.clipCount ? 1 : -1);
      case "soundEvent":
        return (a, b) => (a.soundEventCount < b.soundEventCount ? 1 : -1);
      case "-clip":
        return (a, b) => (a.clipCount > b.clipCount ? 1 : -1);
      case "-soundEvent":
        return (a, b) => (a.soundEventCount > b.soundEventCount ? 1 : -1);
      case "tag":
        return (a, b) => (a.tag.value < b.tag.value ? 1 : -1);
      case "-tag":
        return (a, b) => (a.tag.value > b.tag.value ? 1 : -1);
      default:
        return (a, b) => (a.tag.value > b.tag.value ? 1 : -1);
    }
  }, [sortBy]);

  const sortedCount = useMemo(() => counts.sort(sortFn), [counts, sortFn]);
  const { items, setSearch, setLimit, limit } = useListWithSearch<{
    tag: types.Tag;
    clipCount: number;
    soundEventCount: number;
  }>({
    options: sortedCount,
    fields: ["tag.key", "tag.value"],
    limit: initialShowMax,
    shouldSort: false,
    threshold: 0.3,
  });

  if (counts.length === 0) {
    return <NoAnnotationTags />;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div>
        There are{" "}
        <span className="font-bold text-blue-500">{counts.length}</span> tags
        registered for this project.
      </div>
      <ListSearch
        limit={limit}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
      />
      <TagTable
        items={items}
        sortBy={sortBy}
        onClickTag={onClickTag}
        tagColorFn={tagColorFn}
        onSortByTag={() =>
          setSortBy((sortBy) => {
            if (sortBy === "tag") {
              return "-tag";
            } else {
              return "tag";
            }
          })
        }
        onSortByClip={() => {
          setSortBy((sortBy) => {
            if (sortBy === "clip") {
              return "-clip";
            } else {
              return "clip";
            }
          });
        }}
        onSortBySoundEvent={() => {
          setSortBy((sortBy) => {
            if (sortBy === "soundEvent") {
              return "-soundEvent";
            } else {
              return "soundEvent";
            }
          });
        }}
      />
      {counts.length > limit && (
        <div className="text-stone-500">
          Showing {limit} of {counts.length} tags. Adjust the search or limit to
          see more.
        </div>
      )}
    </div>
  );
}

function NoAnnotationTags() {
  return (
    <div className="text-stone-500">
      There are no tags in any of the annotations in this project. Consider
      creating more annotations, or adding tags to existing annotations.
    </div>
  );
}

type TagRow = {
  tag: types.Tag;
  clipCount: number;
  soundEventCount: number;
};

function getTagCount({
  projectTags,
  clipTags,
  soundEventTags,
}: {
  projectTags: types.Tag[];
  clipTags: types.TagCount[];
  soundEventTags: types.TagCount[];
}): TagRow[] {
  const mapping: Map<string, TagRow> = new Map();

  for (const projectTag of projectTags) {
    const key = getTagKey(projectTag);

    if (!mapping.has(key)) {
      mapping.set(key, {
        tag: projectTag,
        clipCount: 0,
        soundEventCount: 0,
      });
    }
  }

  for (const clipTag of clipTags) {
    const key = getTagKey(clipTag.tag);

    let prev = mapping.get(key);

    if (prev === undefined) {
      prev = {
        tag: clipTag.tag,
        clipCount: 0,
        soundEventCount: 0,
      };

      mapping.set(key, prev);
    }

    prev.clipCount += clipTag.count;
  }

  for (const soundEventTag of soundEventTags) {
    const key = getTagKey(soundEventTag.tag);

    let prev = mapping.get(key);

    if (prev === undefined) {
      prev = {
        tag: soundEventTag.tag,
        clipCount: 0,
        soundEventCount: 0,
      };

      mapping.set(key, prev);
    }

    prev.soundEventCount += soundEventTag.count;
  }

  return Array.from(mapping.values());
}

function TagTable({
  items,
  sortBy,
  onSortByTag,
  onSortBySoundEvent,
  onSortByClip,
  onClickTag,
  tagColorFn = getTagColor,
}: {
  items: TagRow[];
  sortBy: "clip" | "soundEvent" | "-clip" | "-soundEvent" | "tag" | "-tag";
  onSortByTag?: () => void;
  onSortByClip?: () => void;
  onSortBySoundEvent?: () => void;
  onClickTag?: (tag: types.Tag) => void;
  tagColorFn?: (tag: types.Tag) => Color;
}) {
  return (
    <table className="min-w-full text-left table-fixed">
      <thead>
        <tr>
          <th scope="col" className="py-2">
            <Button padding="p-0" mode="text" onClick={onSortByTag}>
              Tag
              {sortBy == "tag" ? (
                <DescendingIcon className="inline-block ml-2 w-5 h-5" />
              ) : sortBy == "-tag" ? (
                <AscendingIcon className="inline-block ml-2 w-5 h-5" />
              ) : null}
            </Button>
          </th>
          <th scope="col" className="py-2 w-20">
            <Button padding="p-0" mode="text" onClick={onSortByClip}>
              Clips
              {sortBy == "clip" ? (
                <DescendingIcon className="inline-block ml-2 w-5 h-5" />
              ) : sortBy == "-clip" ? (
                <AscendingIcon className="inline-block ml-2 w-5 h-5" />
              ) : (
                <DescendingIcon className="inline-block invisible ml-2 w-5 h-5" />
              )}
            </Button>
          </th>
          <th scope="col" className="py-2 w-20">
            <Button padding="p-0" mode="text" onClick={onSortBySoundEvent}>
              Sound Events
              {sortBy == "soundEvent" ? (
                <DescendingIcon className="inline-block ml-2 w-5 h-5" />
              ) : sortBy == "-soundEvent" ? (
                <AscendingIcon className="inline-block ml-2 w-5 h-5" />
              ) : (
                <DescendingIcon className="inline-block invisible ml-2 w-5 h-5" />
              )}
            </Button>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map(({ tag, clipCount, soundEventCount }) => (
          <tr key={getTagKey(tag)}>
            <td className="py-2 whitespace-nowrap">
              <TagComponent
                tag={tag}
                onClick={() => onClickTag?.(tag)}
                {...tagColorFn(tag)}
              />
            </td>
            <td className="py-2 whitespace-nowrap">{clipCount}</td>
            <td className="py-2 whitespace-nowrap">{soundEventCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
