import type { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import Canvas from "@/lib/components/spectrograms/Canvas";

import useViewport from "@/lib/hooks/window/useViewport";

import drawImage from "@/lib/draw/image";
import type { Position, ScrollEvent, SpectrogramWindow } from "@/lib/types";

const meta: Meta<typeof Canvas> = {
  title: "Spectrograms/Canvas",
  component: Canvas,
};

export default meta;

type Story = StoryObj<typeof Canvas>;

export const Primary: Story = {
  args: {
    drawFn: (ctx) => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    viewport: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
    height: 400,
  },
};

const CanvasWithHooks = () => {
  const image = new Image();

  image.src =
    "https://upload.wikimedia.org/wikipedia/commons/5/5f/Testbeeld_MK9.png";

  const bounds = {
    time: { min: 0, max: 1 },
    freq: { min: 0, max: 1 },
  };

  const initial = {
    time: { min: 0, max: 0.2 },
    freq: { min: 0, max: 0.5 },
  };

  const drawFn = (
    ctx: CanvasRenderingContext2D,
    viewport: SpectrogramWindow,
  ) => {
    drawImage({
      ctx,
      image,
      viewport: viewport,
      imageBounds: bounds,
      buffer: bounds,
    });
  };

  const { viewport, expand, shift, zoomToPosition, centerOn } = useViewport({
    initial,
    bounds,
  });

  const onMove = useCallback(
    ({ shift: { time, freq } }: { shift: Position }) => {
      shift({ time: -time, freq });
    },
    [shift],
  );

  const onScroll = useCallback(
    ({
      position,
      ctrlKey,
      shiftKey,
      altKey,
      timeFrac,
      freqFrac,
      deltaX,
      deltaY,
    }: ScrollEvent) => {
      if (altKey) {
        zoomToPosition({
          position,
          factor: 1 + 4 * timeFrac * (shiftKey ? deltaX : deltaY),
        });
      } else if (ctrlKey) {
        expand({
          time: timeFrac * (shiftKey ? deltaX : deltaY),
          freq: freqFrac * (shiftKey ? deltaY : deltaX),
        });
      } else {
        shift({
          time: timeFrac * (shiftKey ? deltaY : deltaX),
          freq: -freqFrac * (shiftKey ? deltaX : deltaY),
        });
      }
    },
    [expand, shift, zoomToPosition],
  );

  const onDoubleClick = useCallback(
    ({ position }: { position: Position }) => {
      centerOn(position);
    },
    [centerOn],
  );

  return (
    <div style={{ height: 768, width: 1024 }}>
      <Canvas
        height={"100%"}
        viewport={viewport}
        drawFn={drawFn}
        onMove={onMove}
        onScroll={onScroll}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <CanvasWithHooks />,
};
