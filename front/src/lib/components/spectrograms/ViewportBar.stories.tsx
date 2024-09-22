import type { Meta, StoryObj } from "@storybook/react";

import ViewportBar from "@/lib/components/spectrograms/ViewportBar";

import useSpectrogramBarInteractions from "@/lib/hooks/spectrogram/useSpectrogramBarInteractions";
import useViewport from "@/lib/hooks/window/useViewport";

const meta: Meta<typeof ViewportBar> = {
  title: "Spectrograms/SpectrogramBar",
  component: ViewportBar,
};

export default meta;

type Story = StoryObj<typeof ViewportBar>;

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
    <ViewportBar viewport={viewport.viewport} bounds={bounds} {...props} />
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
