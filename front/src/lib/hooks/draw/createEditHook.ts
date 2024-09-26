import { useCallback, useMemo, useState } from "react";
import type { DOMAttributes } from "react";
import { mergeProps, usePress } from "react-aria";

import useElementHover from "@/lib/hooks/draw/useElementHover";
import useDrag from "@/lib/hooks/utils/useDrag";
import type { EventKeys } from "@/lib/hooks/utils/useDrag";

import { type EditableElement, drawEditableElement } from "@/lib/draw/edit";
import type { Style } from "@/lib/draw/styles";
import type { Dimensions, Pixel } from "@/lib/types";

interface UseEditObjectProps<J> {
  dimensions: Dimensions;
  object: J | null;
  enabled: boolean;
  style?: Style;
  onChange?: (obj: J) => void;
  onDrop?: (obj: J) => void;
  onDeselect?: () => void;
}

const PRIMARY = "rgb(16 185 129)";

const EDIT_STYLE = {
  borderColor: PRIMARY,
  fillColor: PRIMARY,
  borderWidth: 2,
  borderDash: [6, 6],
  fillAlpha: 0.2,
};

export default function createEditHook<J, T>(
  createEditableElementsFn: (
    object: J,
    dimensions: Dimensions,
  ) => EditableElement<J>[],
  shiftObject: (object: J, start: Pixel, end: Pixel) => J,
) {
  function useEdit({
    dimensions,
    object,
    enabled,
    style: style = EDIT_STYLE,
    onChange,
    onDrop,
    onDeselect,
  }: UseEditObjectProps<J>): {
    object: J | null;
    tmpObject: J | null;
    isEditing: boolean;
    active: boolean;
    props: DOMAttributes<T>;
    hovered: EditableElement<J> | null;
    draw: (ctx: CanvasRenderingContext2D) => void;
  } {
    const [tmpObject, setTmpObject] = useState<J | null>(null);
    const [keys, setKeys] = useState<EventKeys>({
      shiftKey: false,
      ctrlKey: false,
    });

    const editableElements: EditableElement<J>[] = useMemo(() => {
      if (object == null) return [];
      return createEditableElementsFn(object, dimensions);
    }, [object, dimensions]);

    const { hovered, hoverProps } = useElementHover({
      elements: editableElements,
      enabled,
    });

    const handleMoveStart = useCallback(() => {
      if (!enabled) return;
      setKeys({ shiftKey: false, ctrlKey: false });
      setTmpObject(object);
    }, [enabled, object]);

    const handleMoveEnd = useCallback(
      ({ ctrlKey }: { ctrlKey?: boolean } = {}) => {
        if (!enabled) return;
        setTmpObject(null);
        if (tmpObject != null && tmpObject !== object) {
          if (!ctrlKey) {
            onChange?.(tmpObject);
          } else {
            onDrop?.(tmpObject);
          }
        }
        setKeys({ shiftKey: false, ctrlKey: false });
      },
      [enabled, object, tmpObject, onChange, onDrop],
    );

    const handleMove = useCallback(
      ({
        initial,
        current,
        shiftKey = false,
        ctrlKey = false,
      }: {
        initial: Pixel;
        current: Pixel;
        shiftKey?: boolean;
        ctrlKey?: boolean;
      }) => {
        if (!enabled || hovered == null || object == null) return;
        setKeys({ shiftKey, ctrlKey });

        if (!shiftKey) {
          setTmpObject(hovered.drag(object, initial, current));
        } else {
          setTmpObject(shiftObject(object, initial, current));
        }
      },
      [hovered, object, enabled],
    );

    const { props: dragProps, isDragging } = useDrag({
      onMoveStart: handleMoveStart,
      onMoveEnd: handleMoveEnd,
      onMove: handleMove,
      enabled,
    });

    const handleOnPress = useCallback(() => {
      if (!enabled || hovered != null || isDragging) return;
      onDeselect?.();
    }, [enabled, hovered, isDragging, onDeselect]);

    const { pressProps } = usePress({
      onPress: handleOnPress,
    });

    const draw = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        if (!enabled || object == null) return;

        // Set the cursor depending on the hovered element
        ctx.canvas.style.cursor = "default";
        if (hovered != null) {
          ctx.canvas.style.cursor = "pointer";
        }
        if (tmpObject != null) {
          ctx.canvas.style.cursor = "grabbing";
          if (keys.ctrlKey) {
            ctx.canvas.style.cursor = "copy";
          }
        }

        const els = createEditableElementsFn(tmpObject ?? object, {
          width: ctx.canvas.width,
          height: ctx.canvas.height,
        });

        els.forEach((element) =>
          drawEditableElement(ctx, element, style, element.id === hovered?.id),
        );
      },
      [enabled, object, style, hovered, tmpObject, keys.ctrlKey],
    );

    const props = enabled ? mergeProps(dragProps, pressProps, hoverProps) : {};

    return {
      props,
      object,
      tmpObject,
      isEditing: tmpObject != null,
      active: enabled,
      hovered,
      draw,
    };
  }
  return useEdit;
}
