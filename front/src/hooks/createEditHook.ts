import { useCallback, useEffect, useMemo, useState } from 'react'
import { useKeyPress, useMouse } from 'react-use'

import useElementHover from '@/hooks/draw/useElementHover'
import { type DragState } from '@/hooks/motions/useDrag'
import { type EditableElement, drawEditableElement } from '@/draw/edit'
import { type Style } from '@/draw/styles'
import { type Position } from '@/utils/types'

interface Dimensions {
  height: number
  width: number
}

interface UseEditObjectProps<J> {
  drag: DragState
  mouse: ReturnType<typeof useMouse>
  dimensions: Dimensions
  object: J | null
  active: boolean
  style: Style
  onChange?: (obj: J) => void
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
    dimensions,
    object,
    active,
    style,
    onChange = () => null,
  }: UseEditObjectProps<J>): {
    object: J | null
    tmpObject: J | null
    isEditing: boolean
    active: boolean
    hovered: number | null
    draw: (ctx: CanvasRenderingContext2D) => void
  } {
    const shift = useKeyPress('Shift')
    const [tmpObject, setTmpObject] = useState<J | null>(null)

    const editableElements: EditableElement<J>[] = useMemo(
      () => {
        if (object == null) return []
        return createEditableElementsFn(object, dimensions)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [object, dimensions.width, dimensions.height],
    )

    // Check which editable element is currently hovered
    const hovered = useElementHover({
      mouse,
      elements: editableElements,
      isDragging: drag.isDragging,
      active,
    })

    // Reset Tmp object when changing editable object
    useEffect(() => {
      setTmpObject(null)
    }, [object])

    // Start and end edit gesture
    useEffect(() => {
      if (active) {
        if (drag.isDragging && tmpObject == null) {
          setTmpObject(object)
        }
        if (!drag.isDragging && tmpObject != null) {
          setTmpObject(null)
          // When dragging ends use the onChange callback with the updated
          // object
          if (tmpObject !== object) {
            onChange(tmpObject)
          }
        }
      }
    }, [drag.isDragging, object, tmpObject, active, onChange])

    const {
      start,
      current
    } = drag

    // On drag modify the object by dragging a single editable element
    useEffect(() => {
      // Only do something if an editable element is being hovered
      if (
        start != null &&
        current != null &&
        hovered != null &&
        active &&
        object != null
      ) {
        if (!shift) {
          // Drag the selected editable element
          const func = editableElements[hovered]
          if (func != null) {
            setTmpObject(
              func.drag(
                object,
                start,
                current,
              ),
            )
          }
        } else {
          // Or shift the whole object
          setTmpObject(
            shiftObject(
              object,
              start,
              current,
            ),
          )
        }
      }
    }, [
      object,
      start,
      current,
      hovered,
      editableElements,
      active,
      shift,
    ])

    const draw = useCallback(
      (ctx: CanvasRenderingContext2D) => {
        if (!active) return
        if (object == null) return

        const els = createEditableElementsFn(tmpObject ?? object, dimensions)

        els.forEach((element, index) =>
          drawEditableElement(
            ctx,
            element,
            style,
            index === hovered || (shift && hovered != null),
          ),
        )
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        active,
        object,
        style,
        hovered,
        tmpObject,
        dimensions.width,
        dimensions.height,
        shift,
      ],
    )

    return {
      object,
      tmpObject,
      isEditing: tmpObject != null,
      active,
      hovered,
      draw,
    }
  }
  return useEdit
}
