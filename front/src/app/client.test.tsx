import { render, screen } from "@testing-library/react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { afterEach, expect, it, vi } from "vite-plus/test";

import { queryClient } from "./client";

afterEach(() => {
  vi.restoreAllMocks();
  queryClient.getMutationCache().clear();
});

it("offers a separate sign-in tab when a write loses authentication", async () => {
  vi.spyOn(toast, "error").mockImplementation(() => "session-expired");
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => {
      throw new AxiosError("Unauthorized", undefined, undefined, undefined, {
        status: 401,
      } as never);
    },
  });

  await expect(mutation.execute(undefined)).rejects.toThrow("Unauthorized");
  expect(toast.error).toHaveBeenCalledOnce();
  expect(toast.error).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ id: "session-expired", duration: Infinity }),
  );
  render(vi.mocked(toast.error).mock.calls[0][0] as React.ReactNode);
  const link = screen.getByRole("link", { name: "Sign in in a new tab" });
  expect(link.getAttribute("href")).toBe("/login");
  expect(link.getAttribute("target")).toBe("_blank");
});

it("does not report an unrelated write failure as an expired session", async () => {
  vi.spyOn(toast, "error").mockImplementation(() => "session-expired");
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => {
      throw new AxiosError("Forbidden", undefined, undefined, undefined, {
        status: 403,
      } as never);
    },
  });

  await expect(mutation.execute(undefined)).rejects.toThrow("Forbidden");
  expect(toast.error).not.toHaveBeenCalled();
});

it("clears the expired-session prompt after a successful retry", async () => {
  vi.spyOn(toast, "dismiss").mockImplementation(() => {});
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => "saved",
  });

  await expect(mutation.execute(undefined)).resolves.toBe("saved");
  expect(toast.dismiss).toHaveBeenCalledWith("session-expired");
});
