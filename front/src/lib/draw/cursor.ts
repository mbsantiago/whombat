import { setBorderStyle, setFontStyle } from "@/lib/draw/styles";
import type { Position, SpectrogramWindow } from "@/lib/types";
import { scaleFreqToViewport, scaleTimeToViewport } from "@/lib/utils/geometry";

export function drawCursor(
  ctx: CanvasRenderingContext2D,
  position: Position,
  viewport: SpectrogramWindow,
  {
    buffer = 5,
  }: {
    buffer?: number;
  } = {},
) {
  const y = scaleFreqToViewport(position.freq, viewport, ctx.canvas.height);
  const x = scaleTimeToViewport(position.time, viewport, ctx.canvas.width);

  setBorderStyle(ctx, {
    borderColor: "black",
    borderWidth: 1,
    borderDash: [10, 5],
  });

  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(ctx.canvas.width, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, ctx.canvas.height);
  ctx.stroke();

  setFontStyle(ctx, {
    fontColor: "black",
    textBaseline: "bottom",
    fontSize: 14,
  });
  ctx.fillText(`${position.freq.toFixed(2)} Hz`, x + buffer, y - buffer);
  const height = ctx.measureText(
    `${position.freq.toFixed(2)} Hz`,
  ).emHeightAscent;
  ctx.fillText(
    `${position.time.toFixed(5)} s`,
    x + buffer,
    y - buffer - height,
  );
}
