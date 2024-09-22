import { withActions } from "@storybook/addon-actions/decorator";
import type { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";

import "@/app/globals.css";

const preview: Preview = {
  decorators: [withActions],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
      theme: themes.dark,
    },
  },
  tags: ["autodocs"],
};

export default preview;
