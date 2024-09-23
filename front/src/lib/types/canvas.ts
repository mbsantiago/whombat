import type { DOMAttributes } from "react";

import type {
  DoublePressHandler,
  HoverHandler,
  MoveEndHandler,
  MoveHandler,
  MoveStartHandler,
  PressHandler,
  ScrollHandler,
} from "@/lib/types/handlers";

import type { SpectrogramWindow } from "./viewport";

export type CanvasContext = CanvasRenderingContext2D;

export type DrawFn = (ctx: CanvasContext, viewport: SpectrogramWindow) => void;

export type CanvasProps = {
  /** A callback that is called when the cursor hovers over the canvas. */
  onHover?: HoverHandler;
  /** A callback that is called when the user starts moving the cursor on the
   * canvas. */
  onMoveStart?: MoveStartHandler;
  /** A callback that is called when the user stops moving the cursor on the
   * canvas. */
  onMoveEnd?: MoveEndHandler;
  /** A callback that is called when the user moves the cursor on the canvas.
   * */
  onMove?: MoveHandler;
  /** A callback that is called when the user presses the canvas. */
  onPress?: PressHandler;
  /** A callback that is called when the user scrolls the canvas. */
  onScroll?: ScrollHandler;
  /** A callback that is called when the user double clicks the canvas. */
  onDoubleClick?: DoublePressHandler;
} & Omit<
  DOMAttributes<HTMLCanvasElement>,
  | "onHover"
  | "onMoveStart"
  | "onMoveEnd"
  | "onMove"
  | "onPress"
  | "onScroll"
  | "onDoubleClick"
>;
