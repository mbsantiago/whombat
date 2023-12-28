import { useCallback, useMemo, useState } from "react";
import { mergeProps, usePress } from "react-aria";

import { type EditableElement, drawEditableElement } from "@/draw/edit";
import useElementHover from "@/hooks/draw/useElementHover";
import useDrag from "@/hooks/utils/useDrag";

import type { Style } from "@/draw/styles";
import type { Dimensions, Pixel } from "@/types";
import type { DOMAttributes } from "react";

interface UseEditObjectProps<J> {
  dimensions: Dimensions;
  object: J | null;
  active: boolean;
  style?: Style;
  onChange?: (obj: J) => void;
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
    active,
    style = EDIT_STYLE,
    onChange,
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

    const editableElements: EditableElement<J>[] = useMemo(() => {
      if (object == null) return [];
      return createEditableElementsFn(object, dimensions);
    }, [object, dimensions]);

    const { hovered, hoverProps } = useElementHover({
      elements: editableElements,
      enabled: active,
    });

    const handleMoveStart = useCallback(() => {
      if (!active) return;
      setTmpObject(object);
    }, [active, object]);

    const handleMoveEnd = useCallback(() => {
      if (!active) return;
      setTmpObject(null);
      if (tmpObject != null && tmpObject !== object) {
        onChange?.(tmpObject);
      }
    }, [active, object, tmpObject, onChange]);

    const handleMove = useCallback(
      ({
        initial,
        current,
        shift,
      }: {
        initial: Pixel;
        current: Pixel;
        shift: boolean;
      }) => {
        if (hovered == null || object == null) return;

        if (!shift) {
          setTmpObject(hovered.drag(object, initial, current));
        } else {
          setTmpObject(shiftObject(object, initial, current));
        }
      },
      [hovered, object],
    );

    const { props: dragProps, isDragging } = useDrag({
      onMoveStart: handleMoveStart,
      onMoveEnd: handleMoveEnd,
      onMove: handleMove,
    });

    const handleOnPress = useCallback(() => {
      if (!active || hovered != null || isDragging) return;
      onDeselect?.();
    }, [active, hovered, isDragging, onDeselect]);

    const { pressProps } = usePress({
      onPress: handleOnPress,
    });

    const draw = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        if (!active || object == null) return;

        // Set the cursor depending on the hovered element
        ctx.canvas.style.cursor = "default";
        if (hovered != null) {
          ctx.canvas.style.cursor = "pointer";
        }
        if (tmpObject != null) {
          ctx.canvas.style.cursor = "grabbing";
        }

        const els = createEditableElementsFn(tmpObject ?? object, {
          width: ctx.canvas.width,
          height: ctx.canvas.height,
        });

        els.forEach((element) =>
          drawEditableElement(ctx, element, style, element.id === hovered?.id),
        );
      },
      [active, object, style, hovered, tmpObject],
    );

    const props = active ? mergeProps(dragProps, pressProps, hoverProps) : {};

    return {
      props,
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
