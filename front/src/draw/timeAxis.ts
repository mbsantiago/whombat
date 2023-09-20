import { type Interval } from "@/api/audio";
import {
  type AxisStyle,
  DEFAULT_AXIS_STYLE,
  MAYOR_TICK_STYLE,
  MINOR_TICK_STYLE,
  type TickStyle,
  setBorderStyle,
  setFontStyle,
} from "@/draw/styles";

export function selectResolution(length: number, interval: Interval) {
  const duration = interval.max - interval.min;
  const valPerPixel = duration / length;

  let step = 10 ** Math.ceil(Math.log10(valPerPixel * 40));

  if (duration / step <= 3) {
    step /= 2;
  }

  return {
    mayorTickStep: step,
    minorTickStep: step / 5,
  };
}

export function getTicks(interval: Interval, step: number): number[] {
  const { min, max } = interval;
  const numTicks = Math.floor((max - min) / step) + 1;
  const start = Math.ceil(min / step);
  return Array(numTicks)
    .fill(0)
    .map((_, n) => (start + n) * step);
}

function drawTimeTick(
  ctx: CanvasRenderingContext2D,
  x: number,
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
  ctx.moveTo(x, 0);
  ctx.lineTo(x, length);
  ctx.stroke();
  if (label != null) {
    setFontStyle(ctx, { fontColor: color, textBaseline: "bottom" });
    ctx.fillText(label, x + 2, length);
  }
}

export function parseTime(time: number): string {
  return time.toPrecision(3);
}

export default function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  interval: Interval,
  style: AxisStyle = DEFAULT_AXIS_STYLE,
) {
  const { canvas } = ctx;
  const { width } = canvas;
  const { min, max } = interval;
  const range = max - min;
  const { mayorTickStep, minorTickStep } = selectResolution(width, interval);
  const mayorTicks = getTicks(interval, mayorTickStep);
  const minorTicks = getTicks(interval, minorTickStep);

  mayorTicks.forEach((time) => {
    const x = (width * (time - min)) / range;
    drawTimeTick(ctx, x, {
      label: parseTime(time),
      ...style,
      ...MAYOR_TICK_STYLE,
    });
  });

  minorTicks.forEach((time) => {
    const x = (width * (time - min)) / range;
    drawTimeTick(ctx, x, { ...style, ...MINOR_TICK_STYLE });
  });
}
