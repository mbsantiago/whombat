import { useRef, type ReactNode } from "react";
import { useButton, useComboBox, useFilter } from "react-aria";
import { useComboBoxState } from "react-stately";

import Input from "@/lib/components/inputs/Input";
import InputLabel from "@/lib/components/inputs/InputLabel";
import ListBox from "@/lib/components/ui/ListBox";
import { Popover } from "@/lib/components/ui/Popover2";

export default function ComboBox({
  label,
  children,
  ...props
}: {
  label: string;
  children: ReactNode;
}) {
  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let buttonRef = useRef(null);
  let inputRef = useRef(null);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);

  let { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state,
  );

  return (
    <div style={{ display: "inline-flex", flexDirection: "column" }}>
      <InputLabel {...labelProps}>{label}</InputLabel>
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
            <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
          </Popover>
        )}
      </div>
    </div>
  );
}
