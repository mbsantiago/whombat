import { useEffect, useState } from 'react'
import { useMouse } from 'react-use'
import { isCloseToGeometry } from '@/utils/geometry'
import { convertElementToGeometry, type EditableElement } from '@/draw/edit'

export default function useElementHover<J>({
  elements,
  mouse,
  isDragging = false,
  active = true,
}: {
  elements: EditableElement<J>[]
  mouse: ReturnType<typeof useMouse>
  isDragging?: boolean
  active?: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const { elX, elY } = mouse

  useEffect(() => {
    if (!isDragging && active) {
      setHovered(null)

      elements.some((element, index) => {
        const geom = convertElementToGeometry(element)
        if (isCloseToGeometry([elX, elY], geom)) {
          setHovered(index)
          return true
        }
        return false
      })
    }
  }, [elements, elX, elY, isDragging, active])

  return hovered
}
