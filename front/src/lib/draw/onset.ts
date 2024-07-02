import type { BorderStyle } from "./styles";

const DEFAULT_BORDER_ALPHA = 1;
const DEFAULT_BORDER_WIDTH = 1;
const DEFAULT_BORDER_COLOR = "red";

export const DEFAULT_ONSET_STYLE: BorderStyle = {
  borderColor: DEFAULT_BORDER_COLOR,
  borderWidth: DEFAULT_BORDER_WIDTH,
  borderAlpha: DEFAULT_BORDER_ALPHA,
};

export default function drawOnset(
  ctx: CanvasRenderingContext2D,
  onset: number,
  style: BorderStyle = DEFAULT_ONSET_STYLE,
) {
  const { canvas } = ctx;
  const { height } = canvas;

  if ((style.borderAlpha ?? DEFAULT_BORDER_ALPHA) !== 0) {
    ctx.globalAlpha = style.borderAlpha ?? DEFAULT_BORDER_ALPHA;
    ctx.strokeStyle = style.borderColor ?? DEFAULT_BORDER_COLOR;
    ctx.lineWidth = style.borderWidth ?? DEFAULT_BORDER_WIDTH;
    if (style.borderDash) {
      ctx.setLineDash(style.borderDash);
    }

    ctx.beginPath();
    ctx.moveTo(onset, 0);
    ctx.lineTo(onset, height);
    ctx.stroke();
  }
}
