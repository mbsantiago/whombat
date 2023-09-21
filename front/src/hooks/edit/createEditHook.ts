import { useCallback, useEffect, useMemo, useState } from "react";
import { useKeyPress } from "react-use";

import useElementHover from "@/hooks/draw/useElementHover";
import { type DragState } from "@/hooks/motions/useDrag";
import { type EditableElement, drawEditableElement } from "@/draw/edit";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Style } from "@/draw/styles";
import { type Position } from "@/utils/types";

interface Dimensions {
  height: number;
  width: number;
}

interface UseEditObjectProps<J> {
  drag: DragState;
  mouse: MouseState;
  object: J | null;
  active: boolean;
  style: Style;
  onChange?: (obj: J) => void;
  onClickAway?: () => void;
}

export default function createEditHook<J>(
  createEditableElementsFn: (
    object: J,
    dimensions: Dimensions,
  ) => EditableElement<J>[],
  shiftObject: (object: J, start: Position, end: Position) => J,
) {
  function useEdit({
    drag,
    mouse,
    object,
    active,
    style,
    onChange,
    onClickAway,
  }: UseEditObjectProps<J>): {
    object: J | null;
    tmpObject: J | null;
    isEditing: boolean;
    active: boolean;
    hovered: number | null;
    draw: (ctx: CanvasRenderingContext2D) => void;
  } {
    const [shift] = useKeyPress("Shift");
    const { elW, elH } = mouse;
    const [tmpObject, setTmpObject] = useState<J | null>(null);

    const editableElements: EditableElement<J>[] = useMemo(() => {
      if (object == null) return [];
      return createEditableElementsFn(object, {
        width: elW,
        height: elH,
      });
    }, [object, elW, elH]);

    // Check which editable element is currently hovered
    const hovered = useElementHover({
      mouse,
      elements: editableElements,
      active: active && !drag.isDragging,
    });

    // Reset Tmp object when changing editable object
    useEffect(() => {
      setTmpObject(null);
    }, [object]);

    // Start and end edit gesture
    useEffect(() => {
      if (active) {
        if (drag.isDragging && tmpObject == null) {
          setTmpObject(object);
        }
        if (!drag.isDragging && tmpObject != null) {
          setTmpObject(null);
          // When dragging ends use the onChange callback with the updated
          // object
          if (tmpObject !== object) {
            onChange?.(tmpObject);
          }
        }
      }
    }, [drag.isDragging, object, tmpObject, active, onChange]);

    const { start, current } = drag;

    // On drag modify the object by dragging a single editable element
    useEffect(() => {
      if (!active) return;

      if (
        hovered == null &&
        start != null
      ) {
        onClickAway?.()
      }

      // Only do something if an editable element is being hovered
      if (
        start != null &&
        current != null &&
        hovered != null &&
        object != null
      ) {
        if (!shift) {
          // Drag the selected editable element
          const func = editableElements[hovered];
          if (func != null) {
            setTmpObject(func.drag(object, start, current));
          }
        } else {
          // Or shift the whole object
          setTmpObject(shiftObject(object, start, current));
        }
      }
    }, [object, start, current, hovered, editableElements, active, shift, onClickAway]);

    const draw = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        if (!active || object == null) return;

        const els = createEditableElementsFn(tmpObject ?? object, {
          width: ctx.canvas.width,
          height: ctx.canvas.height,
        });

        els.forEach((element, index) =>
          drawEditableElement(
            ctx,
            element,
            style,
            index === hovered || (shift && hovered != null),
          ),
        );
      },
      [active, object, style, hovered, tmpObject, shift],
    );

    return {
      object,
      tmpObject,
      isEditing: tmpObject != null,
      active,
      hovered,
      draw,
    };
  }
  return useEdit;
}
