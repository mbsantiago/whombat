import { BLUE, BorderStyle, setBorderStyle } from "@/lib/draw/styles";
import type { Coordinates } from "@/lib/types";

const DEFAULT_HANDLE_SIZE = 6;

type HandleStlye = {
  size?: number;
} & BorderStyle;

export const DEFAULT_HANDLE_STYLE = {
  borderColor: BLUE,
  borderWidth: 1,
  size: 7,
};

export default function drawHandle(
  ctx: CanvasRenderingContext2D,
  position: Coordinates,
  { size = DEFAULT_HANDLE_SIZE, ...style }: HandleStlye = DEFAULT_HANDLE_STYLE,
) {
  const [x, y] = position;
  setBorderStyle(ctx, style);
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
}
