import type { Meta, StoryObj } from "@storybook/nextjs";
import type { AxiosError } from "axios";
import { fn } from "storybook/test";

import ErrorModal from "./ErrorModal";

const meta: Meta<typeof ErrorModal> = {
  title: "UI/ErrorModal",
  component: (props) => (
    <div className="w-screen h-screen">
      <ErrorModal {...props} />
    </div>
  ),
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onClose: fn(),
    onCopy: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ErrorModal>;

const mockAxiosError: AxiosError = {
  name: "AxiosError",
  message: "Request failed with status code 500",
  // @ts-ignore
  config: {},
  isAxiosError: true,
  toJSON: () => ({}),
  response: {
    data: {
      exception: "InternalServerError",
      traceback:
        'Traceback (most recent call last):...\n  File "/app/main.py", line 10, in <module>\n    raise Exception("Something went wrong on the server")\nException: Something went wrong on the server',
      detail: "Something went wrong on the server",
    },
    status: 500,
    statusText: "Internal Server Error",
    headers: {},
    // @ts-ignore
    config: {},
    request: {},
  },
};

export const Default: Story = {
  args: {
    error: mockAxiosError,
  },
};
