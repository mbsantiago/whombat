import type { SpectrogramWindow } from "@/types";

const FONT_SIZE = 30;
const FONT_FAMILY = "system-ui";
const COLORS = {
  ERROR: "#dc3545",
  BACKGROUND: "#f8f9fa",
  FOREGROUND: "#212529",
};

/* Break a text into multiple lines of a given maximum width
 */
export function getLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const word = words[i];
    const { width } = ctx.measureText(`${currentLine} ${word}`);
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

interface DrawTextConfig {
  maxWidth?: number;
  fontSize?: number;
  color?: string;
  fontAlpha?: number;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

interface CanvasPosition {
  x: number;
  y: number;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: CanvasPosition,
  {
    maxWidth,
    color = COLORS.FOREGROUND,
    fontSize = FONT_SIZE,
    fontFamily = FONT_FAMILY,
    textAlign = "center",
    textBaseline = "middle",
    fontAlpha = 1,
  }: DrawTextConfig = {},
) {
  ctx.globalAlpha = fontAlpha;
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;

  const lines = getLines(ctx, text, maxWidth ?? ctx.canvas.width);
  const verticalOffset = (FONT_SIZE * (lines.length - 1)) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      position.x,
      position.y + index * FONT_SIZE - verticalOffset,
      maxWidth,
    );
  });
}

export function drawLoadingState(ctx: CanvasRenderingContext2D) {
  const { canvas } = ctx;
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawText(ctx, "Loading...", { x: canvas.width / 2, y: canvas.height / 2 });
  ctx.canvas.setAttribute("class", "blink");
}

export function drawErrorState(ctx: CanvasRenderingContext2D, error: string) {
  const { canvas } = ctx;
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawText(
    ctx,
    `Error: ${error}`,
    { x: canvas.width / 2, y: canvas.height / 2 },
    { color: COLORS.ERROR, maxWidth: canvas.width * 0.8 },
  );
}

export function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  window: SpectrogramWindow,
  bounds: SpectrogramWindow,
) {
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const interval = bounds.time;
  const maxFreq = bounds.freq.max;

  const totalDuration = interval.max - interval.min;
  const startTimeRel = (window.time.min - interval.min) / totalDuration;
  const highFreqRel = window.freq.max / maxFreq;

  const sx = startTimeRel * image.width;
  const sy = (1 - highFreqRel) * image.height;
  const sWidth =
    ((window.time.max - window.time.min) * image.width) / totalDuration;
  const sHeight =
    ((window.freq.max - window.freq.min) * image.height) / maxFreq;
  const dx = 0;
  const dy = 0;
  const dWidth = ctx.canvas.width;
  const dHeight = ctx.canvas.height;

  ctx.globalAlpha = 1;
  ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

export interface DrawImageProps {
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
}

export default function drawImage({
  ctx,
  image,
  window,
  bounds,
}: DrawImageProps) {
  ctx.canvas.setAttribute("class", "");
  drawImageOnCanvas(ctx, image, window, bounds);
}
