import { type Interval } from "@/api/audio";
import {
  setFontStyle,
  setBorderStyle,
  type TickStyle,
  type AxisStyle,
  DEFAULT_AXIS_STYLE,
  MINOR_TICK_STYLE,
  MAYOR_TICK_STYLE,
} from "@/draw/styles";
import { selectResolution, getTicks } from "@/draw/timeAxis";

function drawFreqTick(
  ctx: CanvasRenderingContext2D,
  y: number,
  {
    label,
    length = 10,
    width = 1,
    alpha = 1,
    color = "black",
  }: {
    label?: string;
  } & Partial<TickStyle> = {},
) {
  setBorderStyle(ctx, {
    borderColor: color,
    borderWidth: width,
    borderAlpha: alpha,
    borderDash: [],
  });
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(length, y);
  ctx.stroke();
  if (label != null) {
    ctx.save();
    ctx.translate(length, y);
    ctx.rotate(-Math.PI / 2);
    setFontStyle(ctx, { fontColor: color, textBaseline: "bottom" });
    ctx.fillText(label, 2, 0);
    ctx.restore();
  }
}

export function parseFreq(freq: number): string {
  if (freq >= 1e5) return freq.toPrecision(2);
  return Math.round(freq).toString();
}

export default function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  interval: Interval,
  style: AxisStyle = DEFAULT_AXIS_STYLE,
) {
  const { canvas } = ctx;
  const { height } = canvas;
  const { min, max } = interval;
  const range = max - min;
  const { mayorTickStep, minorTickStep } = selectResolution(height, interval);
  const mayorTicks = getTicks(interval, mayorTickStep);
  const minorTicks = getTicks(interval, minorTickStep);

  mayorTicks.forEach((freq) => {
    const y = (height * (max - freq)) / range;
    drawFreqTick(ctx, y, {
      label: parseFreq(freq),
      ...style,
      ...MAYOR_TICK_STYLE,
    });
  });

  minorTicks.forEach((freq) => {
    const y = (height * (max - freq)) / range;
    drawFreqTick(ctx, y, { ...style, ...MINOR_TICK_STYLE });
  });
}
