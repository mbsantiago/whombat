import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import useViewport from "@/hooks/window/useWindow";
import useViewportNavigation from "@/hooks/interactions/useViewportNavigation";

const meta: Meta<typeof SpectrogramBar> = {
  title: "SpectrogramBar",
  parameters: {
    actions: { argTypesRegex: "^on.*" },
  },
  tags: ["autodocs"],
  component: SpectrogramBar,
  decorators: [withActions],
};

export default meta;

type Story = StoryObj<typeof SpectrogramBar>;

const SpectrogramBarWithHooks = () => {
  const bounds = {
    time: { min: 0, max: 1 },
    freq: { min: 0, max: 1 },
  };
  const initial = {
    time: { min: 0, max: 0.2 },
    freq: { min: 0, max: 0.5 },
  };

  const { viewport, centerOn, expand, shift, save } = useViewport({
    initial,
    bounds,
  });

  const props = useViewportNavigation({ centerOn, expand, shift, save });

  return <SpectrogramBar viewport={viewport} bounds={bounds} {...props} />;
};

export const Primary: Story = {
  render: () => <SpectrogramBarWithHooks />,
};
