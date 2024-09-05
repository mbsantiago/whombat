import type { Meta, StoryObj } from "@storybook/react";

import ClipAnnotationSpectrogram from "@/lib/components/clip_annotations/ClipAnnotationSpectrogram";

const meta: Meta<typeof ClipAnnotationSpectrogram> = {
  title: "ClipAnnotation/ClipAnnotationSpectrogram",
  component: ClipAnnotationSpectrogram,
};

export default meta;

type Story = StoryObj<typeof ClipAnnotationSpectrogram>;

export const Panning: Story = {
  args: {
    samplerate: 44100,

    viewport: {
      time: {
        min: 0,
        max: 2,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    bounds: {
      time: {
        min: 0,
        max: 10,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    annotationMode: "none",
    spectrogramMode: "panning",
  },
};

export const Zooming: Story = {
  args: {
    samplerate: 44100,

    viewport: {
      time: {
        min: 0,
        max: 2,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    bounds: {
      time: {
        min: 0,
        max: 10,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    annotationMode: "none",
    spectrogramMode: "zooming",
  },
};

export const Drawing: Story = {
  args: {
    samplerate: 44100,

    viewport: {
      time: {
        min: 0,
        max: 2,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    bounds: {
      time: {
        min: 0,
        max: 10,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    annotationMode: "drawing",
    spectrogramMode: "idle",
  },
};

export const Selecting: Story = {
  args: {
    samplerate: 44100,

    viewport: {
      time: {
        min: 0,
        max: 2,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    bounds: {
      time: {
        min: 0,
        max: 10,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    annotationMode: "selecting",
    spectrogramMode: "idle",
  },
};

export const Editing: Story = {
  args: {
    samplerate: 44100,

    viewport: {
      time: {
        min: 0,
        max: 2,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    bounds: {
      time: {
        min: 0,
        max: 10,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    annotationMode: "editing",
    spectrogramMode: "idle",
  },
};

export const Deleting: Story = {
  args: {
    samplerate: 44100,

    viewport: {
      time: {
        min: 0,
        max: 2,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    bounds: {
      time: {
        min: 0,
        max: 10,
      },

      freq: {
        min: 0,
        max: 22050,
      },
    },

    annotationMode: "deleting",
    spectrogramMode: "idle",
  },
};
