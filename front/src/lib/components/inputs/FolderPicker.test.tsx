import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    const browse = vi.fn(async () => makeListing("drill", "/audio/drill"));

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

  it("completes typed paths and accepts the highlighted suggestion", async () => {
    const suggestion = {
      name: "day1",
      path: "drill/day1",
      absolute: "/audio/drill/day1",
    };
    const browse = vi.fn(async (path: string) =>
      makeListing(path, `/audio/${path}`),
    );
    const complete = vi.fn(async () => [suggestion]);
    render(
      <FolderPicker
        onChange={() => {}}
        browseDirectories={browse}
        completeDirectories={complete}
      />,
    );

    const input = await screen.findByRole("combobox", {
      name: "Type a folder path",
    });
    fireEvent.change(input, { target: { value: "drill/da" } });
    await screen.findByRole("option", { name: "drill/day1" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(
      screen
        .getByRole("option", { name: "drill/day1" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(browse).toHaveBeenLastCalledWith("drill/day1"));
    expect(complete).toHaveBeenCalledWith("drill/da");
  });

  it("does not reopen suggestions from a completion request pending during navigation", async () => {
    let resolveCompletion!: (
      directories: { name: string; path: string; absolute: string }[],
    ) => void;
    const browse = vi.fn(async (path: string) =>
      path === ""
        ? makeListing("", "/audio", [
            { name: "drill", path: "drill", absolute: "/audio/drill" },
          ])
        : makeListing("drill", "/audio/drill"),
    );
    const complete = vi.fn(
      () =>
        new Promise<{ name: string; path: string; absolute: string }[]>(
          (resolve) => {
            resolveCompletion = resolve;
          },
        ),
    );
    render(
      <FolderPicker
        onChange={() => {}}
        browseDirectories={browse}
        completeDirectories={complete}
      />,
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "drill" } });
    await waitFor(() => expect(complete).toHaveBeenCalledWith("drill"));
    fireEvent.click(screen.getByRole("button", { name: "drill" }));
    await screen.findByText("/audio/drill");
    resolveCompletion([
      { name: "day1", path: "drill/day1", absolute: "/audio/drill/day1" },
    ]);

    await waitFor(() =>
      expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe(
        "false",
      ),
    );
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("validates and commits a typed path on Enter using the canonical listing", async () => {
    const onChange = vi.fn();
    const browse = vi.fn(async (path: string) =>
      path === "alias"
        ? makeListing("canonical", "/audio/canonical")
        : makeListing("", "/audio"),
    );
    render(
      <FolderPicker
        onChange={onChange}
        browseDirectories={browse}
        completeDirectories={vi.fn(async () => [])}
      />,
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "alias" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("/audio/canonical"),
    );
    expect(browse).toHaveBeenLastCalledWith("alias");
    expect((input as HTMLInputElement).value).toBe("canonical");
  });

  it("shows inline feedback and does not commit an invalid typed path", async () => {
    const onChange = vi.fn();
    const browse = vi.fn(async (path: string) => {
      if (path) throw new Error("not found");
      return makeListing("", "/audio");
    });
    render(
      <FolderPicker
        onChange={onChange}
        browseDirectories={browse}
        completeDirectories={vi.fn(async () => [])}
      />,
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "../outside" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText("Could not read that folder.")).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("validates and commits a typed path on blur", async () => {
    const onChange = vi.fn();
    const browse = vi.fn(async (path: string) =>
      path === "drill/day1"
        ? makeListing("drill/day1", "/audio/drill/day1")
        : makeListing("", "/audio"),
    );
    render(
      <FolderPicker
        onChange={onChange}
        browseDirectories={browse}
        completeDirectories={vi.fn(async () => [])}
      />,
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "drill/day1" } });
    fireEvent.blur(input);

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("/audio/drill/day1"),
    );
    expect(browse).toHaveBeenLastCalledWith("drill/day1");
  });

  it("validates the typed path when Use this folder is clicked", async () => {
    const onChange = vi.fn();
    const browse = vi.fn(async (path: string) =>
      path === "drill/day1"
        ? makeListing("drill/day1", "/audio/drill/day1")
        : makeListing("", "/audio"),
    );
    render(
      <FolderPicker
        onChange={onChange}
        browseDirectories={browse}
        completeDirectories={vi.fn(async () => [])}
      />,
    );

    const input = await screen.findByRole("combobox");
    const useFolder = screen.getByRole("button", { name: "Use this folder" });
    fireEvent.change(input, { target: { value: "drill/day1" } });
    fireEvent.mouseDown(useFolder);
    fireEvent.blur(input);
    fireEvent.click(useFolder);

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("/audio/drill/day1"),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(browse).toHaveBeenLastCalledWith("drill/day1");
  });

  it("waits for a typed path to validate before submitting its form", async () => {
    const onSubmit = vi.fn();
    const browse = vi.fn(async (path: string) =>
      path === "drill/day1"
        ? makeListing("drill/day1", "/audio/drill/day1")
        : makeListing("", "/audio"),
    );
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FolderPicker
          onChange={() => {}}
          browseDirectories={browse}
          completeDirectories={vi.fn(async () => [])}
        />
        <button type="submit">Create Dataset</button>
      </form>,
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "drill/day1" } });
    fireEvent.submit(
      screen.getByRole("button", { name: "Create Dataset" }).closest("form")!,
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(browse).toHaveBeenLastCalledWith("drill/day1");
  });

  it("ignores a pending blur result after breadcrumb navigation", async () => {
    let resolveStale!: (listing: DatasetDirectoryBrowse) => void;
    const browse = vi.fn((path: string) => {
      if (path === "stale/path") {
        return new Promise<DatasetDirectoryBrowse>((resolve) => {
          resolveStale = resolve;
        });
      }
      return Promise.resolve(
        path === "drill"
          ? makeListing("drill", "/audio/drill", [], "")
          : makeListing("drill/day1", "/audio/drill/day1", [], "drill"),
      );
    });
    const onChange = vi.fn();
    render(
      <FolderPicker
        onChange={onChange}
        browseDirectories={browse}
        completeDirectories={vi.fn(async () => [])}
      />,
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "stale/path" } });
    fireEvent.blur(input);
    fireEvent.click(await screen.findByRole("button", { name: "drill" }));
    await screen.findByText("/audio/drill");
    resolveStale(makeListing("stale/path", "/audio/stale/path"));

    await waitFor(() =>
      expect(screen.getByLabelText("Current absolute path").textContent).toBe(
        "/audio/drill",
      ),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("initializes the listing from the existing value", async () => {
    const browse = vi.fn(async (path: string) =>
      makeListing("canonical", "/audio/canonical"),
    );
    render(
      <FolderPicker
        value="/audio/old"
        onChange={() => {}}
        browseDirectories={browse}
      />,
    );

    expect(
      (await screen.findByLabelText("Current absolute path")).textContent,
    ).toBe("/audio/canonical");
    expect(browse).toHaveBeenCalledWith("/audio/old");
  });

  it("does not request completion when navigating with Up or breadcrumbs", async () => {
    const browse = vi.fn(async (path: string) =>
      path === "drill/day1"
        ? makeListing("drill/day1", "/audio/drill/day1", [], "drill")
        : path === "drill"
          ? makeListing(
              "drill",
              "/audio/drill",
              [
                {
                  name: "day1",
                  path: "drill/day1",
                  absolute: "/audio/drill/day1",
                },
              ],
              "",
            )
          : makeListing("", "/audio", [
              { name: "drill", path: "drill", absolute: "/audio/drill" },
            ]),
    );
    const complete = vi.fn(async () => []);
    render(
      <FolderPicker
        onChange={() => {}}
        browseDirectories={browse}
        completeDirectories={complete}
      />,
    );

    await screen.findByRole("button", { name: "Use this folder" });
    fireEvent.click(screen.getByRole("button", { name: "drill" }));
    await waitFor(() => expect(browse).toHaveBeenLastCalledWith("drill"));
    await screen.findByText("day1");
    fireEvent.click(screen.getByRole("button", { name: "day1" }));
    await waitFor(() => expect(browse).toHaveBeenLastCalledWith("drill/day1"));
    await screen.findByText("/audio/drill/day1");
    fireEvent.click(screen.getByRole("button", { name: "Up" }));
    await waitFor(() => expect(browse).toHaveBeenLastCalledWith("drill"));
    await screen.findByText("day1");
    fireEvent.click(screen.getByRole("button", { name: "day1" }));
    await screen.findByText("/audio/drill/day1");
    fireEvent.click(screen.getByRole("button", { name: "drill" }));
    await waitFor(() => expect(browse).toHaveBeenLastCalledWith("drill"));
    expect(complete).not.toHaveBeenCalled();
  });
});
