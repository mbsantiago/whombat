import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import CreateDataset from "./DatasetCreate";

function getInput(container: HTMLElement, name: string) {
  const element = container.querySelector(`input[name="${name}"]`);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`input ${name} not found`);
  }
  return element;
}

describe("CreateDataset", () => {
  it("clears the folder tag option when sub-folders are turned off", async () => {
    const onCreate = vi.fn();
    const { container } = render(<CreateDataset onCreateDataset={onCreate} />);

    const include = getInput(container, "include_subfolders");
    const folderTag = getInput(container, "tag_recordings_by_folder");

    // Defaults: sub-folders on, folder tags off.
    expect(include.checked).toBe(true);
    expect(folderTag.checked).toBe(false);

    fireEvent.click(folderTag);
    expect(folderTag.checked).toBe(true);

    fireEvent.click(include);

    // The dependent option must not stay visually ticked.
    expect(include.checked).toBe(false);
    expect(folderTag.checked).toBe(false);
    expect(folderTag.disabled).toBe(true);

    fireEvent.change(getInput(container, "name"), {
      target: { value: "demo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create dataset/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        include_subfolders: false,
        tag_recordings_by_folder: false,
      }),
    );
  });
});
