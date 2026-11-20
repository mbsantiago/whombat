import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import type { DatasetDirectoryBrowse } from "@/lib/types";

import FolderPicker from "./FolderPicker";

function makeListing(
  path: string,
  absolute: string,
  directories: DatasetDirectoryBrowse["directories"] = [],
  parent: string | null = null,
): DatasetDirectoryBrowse {
  return { path, absolute, parent, directories };
}

describe("FolderPicker", () => {
  it("lists the audio root on mount", async () => {
    const browse = vi
      .fn(async (path: string) => makeListing(path, `/audio/${path}`))
      .mockResolvedValueOnce(
        makeListing("", "/audio", [
          { name: "drill", path: "drill", absolute: "/audio/drill" },
        ]),
      );

    render(<FolderPicker onChange={() => {}} browseDirectories={browse} />);

    await screen.findByText("drill");
    expect(browse).toHaveBeenCalledWith("");
  });

  it("navigates into a subfolder", async () => {
    const browse = vi
      .fn(async (path: string) => makeListing(path, `/audio/${path}`))
      .mockResolvedValueOnce(
        makeListing("", "/audio", [
          { name: "drill", path: "drill", absolute: "/audio/drill" },
        ]),
      )
      .mockResolvedValueOnce(
        makeListing(
          "drill",
          "/audio/drill",
          [{ name: "day1", path: "drill/day1", absolute: "/audio/drill/day1" }],
          "",
        ),
      );

    render(<FolderPicker onChange={() => {}} browseDirectories={browse} />);

    fireEvent.click(await screen.findByText("drill"));
    await screen.findByText("day1");

    expect(browse).toHaveBeenLastCalledWith("drill");
  });

  it("emits the absolute path of the current folder", async () => {
    const onChange = vi.fn();
    const browse = vi.fn(async () =>
      makeListing("drill", "/audio/drill"),
    );

    render(<FolderPicker onChange={onChange} browseDirectories={browse} />);

    fireEvent.click(await screen.findByText("Use this folder"));

    expect(onChange).toHaveBeenCalledWith("/audio/drill");
  });

  it("does not emit a folder when the listing failed", async () => {
    const onChange = vi.fn();
    const browse = vi.fn(async () => {
      throw new Error("nope");
    });

    render(<FolderPicker onChange={onChange} browseDirectories={browse} />);

    await screen.findByText("Could not read that folder.");
    fireEvent.click(screen.getByText("Use this folder"));

    expect(onChange).not.toHaveBeenCalled();
  });
});
