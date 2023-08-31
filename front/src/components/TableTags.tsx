import { type Tag as TagType } from "@/api/tags";
import { useState, useEffect, useRef, type HTMLProps } from "react";
import { Popover } from "@headlessui/react";
import Tag from "@/components/Tag";
import TagSearchBar from "@/components/TagSearchBar";
import { AddIcon } from "@/components/icons";
import useStore from "@/store";
import Button from "@/components/Button";

export default function TableTags({
  tags,
  onAdd,
  onRemove,
  ...props
}: {
  tags: TagType[];
  onAdd?: (tag: TagType) => void;
  onRemove?: (tag: TagType) => void;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  const ref = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const getTagColor = useStore((state) => state.getTagColor);

  useEffect(() => {
    if (active) {
      console.log("focus", ref.current);
      ref.current?.focus();
    }
  }, [active]);

  return (
    <div className="m-0 h-full flex w-full flex-row flex-wrap items-center overflow-scroll gap-2 px-1">
      <Popover as="div" className="inline-block text-left">
        {({ open }) => (
          <>
            <Popover.Button
              as={Button}
              variant="secondary"
              mode="text"
              className="whitespace-nowrap py-1"
              onClick={() => setActive(true)}
            >
              <AddIcon className="inline-block h-5 w-5 align-middle" />
              add
            </Popover.Button>
            {open && (
              <Popover.Panel
                className="absolute mt-1 w-72 origin-top-right"
                static
                onBlur={() => setActive(false)}
              >
                {({ close }) => (
                  <TagSearchBar
                    // @ts-ignore
                    ref={ref}
                    // @ts-ignore
                    onSelect={(tag) => {
                      onAdd?.(tag);
                      setActive(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        close();
                        setActive(false);
                      } else if (e.key === "Enter") {
                        close();
                        setActive(false);
                      }
                    }}
                    onBlur={() => {
                      close();
                      setActive(false);
                    }}
                    {...props}
                  />
                )}
              </Popover.Panel>
            )}
          </>
        )}
      </Popover>
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          tag={tag}
          {...getTagColor(tag)}
          onClick={() => {
            onRemove?.(tag);
          }}
        />
      ))}
    </div>
  );
  //
  // return (
  //   <TagSearchBar
  //     // @ts-ignore
  //     ref={ref}
  //     // @ts-ignore
  //     onSelect={(tag) => {
  //       onAdd?.(tag);
  //       setActive(false);
  //     }}
  //     onKeyDown={(e) => {
  //       if (e.key === "Escape") {
  //         setActive(false);
  //         ref.current?.parentElement?.focus();
  //       } else if (e.key === "Enter") {
  //         setActive(false);
  //         ref.current?.parentElement?.focus();
  //       }
  //     }}
  //     onBlur={() => setActive(false)}
  //     {...props}
  //   />
  // );
}
