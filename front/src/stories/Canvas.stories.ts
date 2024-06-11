import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import Canvas from "@/components/spectrograms/Canvas";

const meta: Meta<typeof Canvas> = {
  title: "Canvas",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  component: Canvas,
  decorators: [withActions],
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
