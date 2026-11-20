"use client";

import { useCallback, useEffect, useState } from "react";

import type { DatasetDirectoryBrowse } from "@/lib/types";

/**
 * Browse the server's audio root one level at a time and pick a folder.
 *
 * Emits the absolute path because dataset creation requires an existing
 * directory, not a path relative to the audio root.
 */
export default function FolderPicker({
  value,
  onChange,
  browseDirectories,
}: {
  value?: string;
  onChange: (absolutePath: string) => void;
  browseDirectories: (path: string) => Promise<DatasetDirectoryBrowse>;
}) {
  const [listing, setListing] = useState<DatasetDirectoryBrowse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        setListing(await browseDirectories(path));
      } catch {
        setError("Could not read that folder.");
      } finally {
        setLoading(false);
      }
    },
    [browseDirectories],
  );

  useEffect(() => {
    void load("");
  }, [load]);

  return (
    <div className="flex flex-col gap-2 rounded-md border p-2 text-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
          disabled={!listing?.parent}
          onClick={() => void load(listing?.parent ?? "")}
        >
          Up
        </button>
        <span className="truncate font-mono text-xs">
          /{listing?.path ?? ""}
        </span>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-slate-500">Loading…</p>}

      <ul className="max-h-56 overflow-y-auto">
        {listing?.directories.map((directory) => (
          <li key={directory.absolute}>
            <button
              type="button"
              className="w-full truncate rounded px-2 py-1 text-left hover:bg-slate-100"
              onClick={() => void load(directory.path)}
            >
              {directory.name}
            </button>
          </li>
        ))}
        {listing && !loading && listing.directories.length === 0 && (
          <li className="px-2 py-1 text-slate-500">No subfolders.</li>
        )}
      </ul>

      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <span className="truncate text-xs text-slate-600">
          Selected: {value || "none"}
        </span>
        <button
          type="button"
          className="rounded bg-slate-800 px-3 py-1 text-white disabled:opacity-40"
          disabled={!listing}
          onClick={() => {
            if (listing) onChange(listing.absolute);
          }}
        >
          Use this folder
        </button>
      </div>
    </div>
  );
}
