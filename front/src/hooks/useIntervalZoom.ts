import { useCallback } from 'react'

// import useCreateInterval from './useCreateInterval'
import { scaleIntervalToWindow } from '../utils/geometry'
// import { type Interval, type Dimensions } from '../types/geometry'
import { type DragState } from './useDrag'
import { type SpectrogramWindowState } from './useSpectrogramWindow'

export const ZOOM_SELECTION_STYLE = {
  fillAlpha: 0.3,
  fillColor: 'red',
  borderWidth: 1,
  borderColor: 'red',
  borderDash: [4, 4],
}

// export default function useIntervalZoom({
//   windowState,
//   dimensions,
//   drag,
//   active,
//   onZoom = () => null,
// }: {
//   windowState: SpectrogramWindowState
//   dimensions: Dimensions
//   drag: DragState
//   onZoom: () => void
//   active: boolean
// }) {
//   const { window, setWindow } = windowState
//
//   const handleSelectIntervalZoom = useCallback(
//     (interval: Interval) => {
//       const [start, end] = scaleIntervalToWindow(dimensions, interval, window)
//       setWindow({
//         time: { min: start, max: end },
//         freq: window.freq,
//       })
//       onZoom()
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [dimensions.width, dimensions.height, window, setWindow, onZoom],
//   )
//
//   return useCreateInterval({
//     drag,
//     onCreate: handleSelectIntervalZoom,
//     active,
//     style: ZOOM_SELECTION_STYLE,
//   })
// }
//
