import type { Meta, StoryObj } from "@storybook/react";
import type { AxiosError } from "axios";

import ErrorToast from "./ErrorToast";

const meta: Meta<typeof ErrorToast> = {
  title: "UI/ErrorToast",
  component: ErrorToast,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ErrorToast>;

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
    message: "An unexpected error occurred. Please try again later.",
  },
};

export const NoTraceback: Story = {
  args: {
    error: {
      ...mockAxiosError,
      response: {
        ...mockAxiosError.response,
        data: {
          exception: "ValidationError",
          detail: "Invalid input provided.",
        },
      },
    } as AxiosError,
    message: "There was an issue with your input.",
  },
};

export const GenericError: Story = {
  args: {
    error: {
      ...mockAxiosError,
      response: {
        ...mockAxiosError.response,
        data: {},
      },
    } as AxiosError,
    message: "A generic error occurred.",
  },
};
