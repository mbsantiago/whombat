import type {
  MoveEndEvent as MoveEndEventAria,
  MoveMoveEvent as MoveMoveEventAria,
  MoveStartEvent as MoveStartEventAria,
  PressEvent as PressEventAria,
} from "react-aria";

import type { Position } from "./viewport";

export type ScrollEvent = {
  position: Position;
  timeFrac: number;
  freqFrac: number;
  type: "wheel";
  deltaX: number;
  deltaY: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
};

export type HoverEvent = {
  position: Position;
};

export type MoveStartEvent = {
  position: Position;
} & MoveStartEventAria;

export type MoveEndEvent = {
  position: Position;
} & MoveEndEventAria;

export type MoveEvent = {
  position: Position;
  initial: Position;
  shift: Position;
} & MoveMoveEventAria;

export type PressEvent = {
  position: Position;
} & PressEventAria;

export type DoublePressEvent = {
  position: Position;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  type: "dblpress";
  stopPropagation: () => void;
  preventDefault: () => void;
};

export type HoverHandler = (event: HoverEvent) => void;

export type MoveStartHandler = (event: MoveStartEvent) => void;

export type MoveEndHandler = (event: MoveEndEvent) => void;

export type MoveHandler = (event: MoveEvent) => void;

export type PressHandler = (event: PressEvent) => void;

export type ScrollHandler = (event: ScrollEvent) => void;

export type DoublePressHandler = (event: DoublePressEvent) => void;

export type CanvasHandlers = {
  onHover?: HoverHandler;
  onMoveStart?: MoveStartHandler;
  onMoveEnd?: MoveEndHandler;
  onMove?: MoveHandler;
  onPress?: PressHandler;
  onScroll?: ScrollHandler;
  onDoubleClick?: DoublePressHandler;
};
