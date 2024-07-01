import type { Meta, StoryObj } from "@storybook/react";
import { withActions } from "@storybook/addon-actions/decorator";

import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import useViewport from "@/hooks/window/useViewport";
import useSpectrogramBarInteractions from "@/hooks/spectrogram/useSpectrogramBarInteractions";

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

  const viewport = useViewport({
    initial,
    bounds,
  });

  const props = useSpectrogramBarInteractions({ viewport });

  return (
    <SpectrogramBar viewport={viewport.viewport} bounds={bounds} {...props} />
  );
};

/** The viewport covers the whole spectrogram */
export const Full: Story = {
  args: {
    viewport: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
    bounds: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
  },
};

/** Zoomed in on time */
export const TimeZoom: Story = {
  args: {
    viewport: {
      time: { min: 0.2, max: 0.5 },
      freq: { min: 0, max: 1 },
    },
    bounds: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
  },
};

/** Zoomed in on frequency */
export const FreqZoom: Story = {
  args: {
    viewport: {
      time: { min: 0, max: 1 },
      freq: { min: 0.2, max: 0.5 },
    },
    bounds: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
  },
};

/** Zoomed in on both time and frequency */
export const Zoomed: Story = {
  args: {
    viewport: {
      time: { min: 0.2, max: 0.5 },
      freq: { min: 0.2, max: 0.5 },
    },
    bounds: {
      time: { min: 0, max: 1 },
      freq: { min: 0, max: 1 },
    },
  },
};

/** Click and drag to pan */
export const Interactive: Story = {
  render: () => <SpectrogramBarWithHooks />,
};
