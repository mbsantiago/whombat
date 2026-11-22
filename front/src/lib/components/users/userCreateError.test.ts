import type { AxiosError } from "axios";
import { describe, expect, it } from "vite-plus/test";

import { userCreateErrorMessage } from "./userCreateError";

function makeError(data?: unknown, status?: number): AxiosError {
  return {
    response: status
      ? { data, status, statusText: "", headers: {}, config: {} as never }
      : undefined,
  } as AxiosError;
}

describe("userCreateErrorMessage", () => {
  it("uses a string detail", () => {
    expect(userCreateErrorMessage(makeError({ detail: "Invalid password" }, 400)))
      .toBe("Invalid password");
  });

  it("extracts validation messages without exposing the full payload", () => {
    expect(
      userCreateErrorMessage(
        makeError({ detail: [{ loc: ["body", "email"], msg: "Invalid email" }] }, 422),
      ),
    ).toBe("Invalid email");
  });

  it("falls back to a status or a network message", () => {
    expect(userCreateErrorMessage(makeError({}, 500))).toBe("Request failed (500)");
    expect(userCreateErrorMessage(makeError())).toBe("Could not connect to the server.");
  });
});
