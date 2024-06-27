import type { SpectrogramWindow } from "@/types";
import {
  intersectWindows,
  getViewportPosition,
  extendWindow,
} from "@/utils/windows";

const FONT_SIZE = 30;
const FONT_FAMILY = "system-ui";
const COLORS = {
  ERROR: "#fecaca",
  LOADING: "#d6d3d1",
  BACKGROUND: "#f8f9fa",
  FOREGROUND: "#212529",
};

/* Break a text into multiple lines of a given maximum width */
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
  viewport: SpectrogramWindow,
  imageBounds: SpectrogramWindow,
  overlap: number = 0.05,
) {
  const duration = imageBounds.time.max - imageBounds.time.min;
  const offset = (duration * overlap) / 2;
  const intersection = intersectWindows(
    viewport,
    extendWindow(imageBounds, { time: -offset, freq: 0 }),
  );

  if (!intersection) {
    return;
  }

  const source = getViewportPosition({
    width: image.width,
    height: image.height,
    viewport: intersection,
    bounds: imageBounds,
  });

  const destination = getViewportPosition({
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    viewport: intersection,
    bounds: viewport,
  });

  ctx.globalAlpha = 1;
  ctx.drawImage(
    image,
    source.left,
    source.top,
    source.width,
    source.height,
    destination.left,
    destination.top,
    destination.width,
    destination.height,
  );
}

export function drawLoadingImage({
  ctx,
  viewport,
  imageBounds,
}: {
  ctx: CanvasRenderingContext2D;
  viewport: SpectrogramWindow;
  imageBounds: SpectrogramWindow;
}) {
  const intersection = intersectWindows(viewport, imageBounds);

  if (!intersection) {
    return;
  }

  const position = getViewportPosition({
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    viewport: intersection,
    bounds: viewport,
  });

  ctx.fillStyle = COLORS.LOADING;
  ctx.fillRect(position.left, position.top, position.width, position.height);
}


export function drawErroredImage({
  ctx,
  viewport,
  imageBounds,
}: {
  ctx: CanvasRenderingContext2D;
  viewport: SpectrogramWindow;
  imageBounds: SpectrogramWindow;
}) {
  const intersection = intersectWindows(viewport, imageBounds);

  if (!intersection) {
    return;
  }

  const position = getViewportPosition({
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    viewport: intersection,
    bounds: viewport,
  });

  ctx.fillStyle = COLORS.ERROR;
  ctx.fillRect(position.left, position.top, position.width, position.height);
}


export interface DrawImageProps {
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  viewport: SpectrogramWindow;
  imageBounds: SpectrogramWindow;
  loading?: boolean;
  error?: boolean;
  overlap?: number;
}

export default function drawImage({
  ctx,
  image,
  viewport,
  imageBounds,
  overlap = 0.1,
  loading = false,
  error = false,
}: DrawImageProps) {
  if (loading) {
    drawLoadingImage({ ctx, viewport, imageBounds });
    return;
  }

  if (error) {
    drawErroredImage({ ctx, viewport, imageBounds });
    return;
  }

  drawImageOnCanvas(ctx, image, viewport, imageBounds, overlap);
}
