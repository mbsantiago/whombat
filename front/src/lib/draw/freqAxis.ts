import {
  type AxisStyle,
  DEFAULT_AXIS_STYLE,
  MAYOR_TICK_STYLE,
  MINOR_TICK_STYLE,
  type TickStyle,
  setBorderStyle,
  setFontStyle,
} from "@/lib/draw/styles";
import { getTicks, parseNum, selectResolution } from "@/lib/draw/timeAxis";
import type { Interval } from "@/lib/types";

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

export default function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  interval: Interval,
  style: AxisStyle = DEFAULT_AXIS_STYLE,
) {
  const { canvas } = ctx;
  const { height } = canvas;
  const { min, max } = interval;
  const range = max - min;
  const { mayorTickStep, minorTickStep, digits } = selectResolution(
    height,
    interval,
  );
  const mayorTicks = getTicks(interval, mayorTickStep);
  const minorTicks = getTicks(interval, minorTickStep);

  mayorTicks.forEach((freq) => {
    const y = (height * (max - freq)) / range;
    drawFreqTick(ctx, y, {
      // Its best to display frequencies in kHz to get a cleaner axis
      // Hence the division by 1000 and 3 digits removed
      label: parseNum(freq / 1000, digits - 3),
      ...style,
      ...MAYOR_TICK_STYLE,
    });
  });

  minorTicks.forEach((freq) => {
    const y = (height * (max - freq)) / range;
    drawFreqTick(ctx, y, { ...style, ...MINOR_TICK_STYLE });
  });
}
