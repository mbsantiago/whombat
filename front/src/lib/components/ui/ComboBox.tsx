import { useRef } from "react";
import { AriaComboBoxOptions, useComboBox, useFilter } from "react-aria";
import { useComboBoxState } from "react-stately";
import type { CollectionChildren } from "@react-types/shared";

import Input from "@/lib/components/inputs/Input";
import InputLabel from "@/lib/components/inputs/InputLabel";
import ListBox from "@/lib/components/ui/ListBox";
import { Popover } from "@/lib/components/ui/Popover2";

export default function ComboBox<T extends object>(
  props: Omit<
    AriaComboBoxOptions<T>,
    "inputRef" | "listBoxRef" | "popoverRef"
  > & { children: CollectionChildren<T> },
) {
  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState<T>({ ...props, defaultFilter: contains });

  let buttonRef = useRef(null);
  let inputRef = useRef(null);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);

  let { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
      buttonRef,
    },
    state,
  );

  return (
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <InputLabel {...labelProps}>{props.label}</InputLabel>
      <div>
        <Input {...inputProps} ref={inputRef} />
        {state.isOpen && (
          <Popover
            state={state}
            triggerRef={inputRef}
            popoverRef={popoverRef}
            isNonModal
            placement="bottom start"
          >
            <ListBox
              {...listBoxProps}
              listBoxRef={listBoxRef}
              listState={state}
            />
          </Popover>
        )}
      </div>
    </div>
  );
}