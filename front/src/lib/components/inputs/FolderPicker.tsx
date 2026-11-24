"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { DatasetDirectory, DatasetDirectoryBrowse } from "@/lib/types";

import Input from "./Input";

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
  completeDirectories,
}: {
  value?: string;
  onChange: (absolutePath: string) => void;
  browseDirectories: (path: string) => Promise<DatasetDirectoryBrowse>;
  completeDirectories?: (path: string) => Promise<DatasetDirectory[]>;
}) {
  const [listing, setListing] = useState<DatasetDirectoryBrowse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [suggestions, setSuggestions] = useState<DatasetDirectory[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const requestId = useRef(0);
  const skipCompletion = useRef(false);
  const skipNextBlur = useRef(false);
  const queryRef = useRef(value ?? "");
  const queryRevision = useRef(0);
  const committedRevision = useRef(-1);
  const initialPath = useRef(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const listingRef = useRef<DatasetDirectoryBrowse | null>(null);
  const pendingBrowse = useRef<{
    path: string;
    promise: Promise<DatasetDirectoryBrowse | null>;
  } | null>(null);
  const browseRequest = useRef(0);

  const load = useCallback(
    (path: string): Promise<DatasetDirectoryBrowse | null> => {
      requestId.current += 1;
      setSuggestions([]);
      setSuggestionsOpen(false);
      if (pendingBrowse.current?.path === path) {
        return pendingBrowse.current.promise;
      }
      const request = ++browseRequest.current;
      setLoading(true);
      setError(null);
      const promise = browseDirectories(path)
        .then(
          (result) => {
            if (request === browseRequest.current) {
              listingRef.current = result;
              setListing(result);
              skipCompletion.current = true;
              queryRef.current = result.path;
              setQuery(result.path);
              setSuggestions([]);
              setSuggestionsOpen(false);
            }
            return result;
          },
          () => {
            if (request === browseRequest.current) {
              setError("Could not read that folder.");
            }
            return null;
          },
        )
        .finally(() => {
          if (request === browseRequest.current) setLoading(false);
          if (pendingBrowse.current?.promise === promise) {
            pendingBrowse.current = null;
          }
        });
      pendingBrowse.current = { path, promise };
      return promise;
    },
    [browseDirectories],
  );

  const navigate = useCallback(
    (path: string) => {
      queryRevision.current += 1;
      void load(path);
    },
    [load],
  );

  const commitValidated = useCallback(
    (result: DatasetDirectoryBrowse | null, revision: number) => {
      if (
        result &&
        queryRevision.current === revision &&
        committedRevision.current !== revision
      ) {
        committedRevision.current = revision;
        onChange(result.absolute);
      }
    },
    [onChange],
  );

  useEffect(() => {
    void load(initialPath.current);
  }, [load]);

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return;
    const onSubmit = (event: Event) => {
      const path = queryRef.current.trim();
      if (!path || path === listingRef.current?.path) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const revision = queryRevision.current;
      const submitter = (event as SubmitEvent).submitter;
      void load(path).then((result) => {
        if (!result || queryRevision.current !== revision) return;
        commitValidated(result, revision);
        form.requestSubmit(
          submitter instanceof HTMLElement
            ? (submitter as HTMLButtonElement)
            : undefined,
        );
      });
    };
    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  }, [commitValidated, load]);

  useEffect(() => {
    if (skipCompletion.current) {
      skipCompletion.current = false;
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if (!completeDirectories || !query.trim()) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    const id = ++requestId.current;
    const timer = window.setTimeout(() => {
      void completeDirectories(query).then(
        (items) => {
          if (id === requestId.current) {
            setSuggestions(items);
            setActiveSuggestion(-1);
            setSuggestionsOpen(items.length > 0);
          }
        },
        () => {
          if (id === requestId.current) setSuggestions([]);
        },
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [completeDirectories, query]);

  const acceptSuggestion = useCallback(
    (directory: DatasetDirectory) => {
      skipCompletion.current = true;
      queryRevision.current += 1;
      setQuery(directory.path);
      queryRef.current = directory.path;
      setSuggestionsOpen(false);
      navigate(directory.path);
    },
    [navigate],
  );

  const breadcrumbParts = (listing?.path ?? "").split("/").filter(Boolean);

  return (
    <div ref={containerRef} className="flex flex-col gap-2 text-sm">
      {completeDirectories && (
        <div className="relative">
          <label
            htmlFor="folder-path"
            className="mb-1 block text-xs font-medium"
          >
            Type a folder path
          </label>
          <Input
            id="folder-path"
            type="text"
            value={query}
            onChange={(event) => {
              skipCompletion.current = false;
              queryRevision.current += 1;
              queryRef.current = event.target.value;
              setQuery(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            onBlur={() => {
              if (skipNextBlur.current) {
                skipNextBlur.current = false;
                return;
              }
              const path = queryRef.current.trim();
              if (path && path !== listing?.path) {
                const revision = queryRevision.current;
                void load(path).then((result) => {
                  commitValidated(result, revision);
                });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSuggestionsOpen(false);
              } else if (
                event.key === "ArrowDown" &&
                suggestionsOpen &&
                suggestions.length
              ) {
                event.preventDefault();
                setActiveSuggestion(
                  (activeSuggestion + 1) % suggestions.length,
                );
              } else if (
                event.key === "ArrowUp" &&
                suggestionsOpen &&
                suggestions.length
              ) {
                event.preventDefault();
                setActiveSuggestion(
                  (activeSuggestion + suggestions.length - 1) %
                    suggestions.length,
                );
              } else if (
                (event.key === "Tab" || event.key === "Enter") &&
                suggestionsOpen &&
                suggestions.length
              ) {
                const chosen =
                  suggestions[activeSuggestion >= 0 ? activeSuggestion : 0];
                if (chosen) {
                  event.preventDefault();
                  acceptSuggestion(chosen);
                }
              } else if (event.key === "Enter") {
                event.preventDefault();
                const path = queryRef.current.trim();
                const revision = queryRevision.current;
                void load(path).then((result) => {
                  commitValidated(result, revision);
                });
              }
            }}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls="folder-suggestions"
            aria-activedescendant={
              activeSuggestion >= 0
                ? `folder-suggestion-${activeSuggestion}`
                : undefined
            }
            placeholder="Start typing a path…"
          />
          {suggestionsOpen && suggestions.length > 0 && (
            <ul
              id="folder-suggestions"
              role="listbox"
              className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white py-1 shadow-lg"
            >
              {suggestions.map((directory, index) => (
                <li
                  id={`folder-suggestion-${index}`}
                  key={directory.absolute}
                  role="option"
                  aria-selected={index === activeSuggestion}
                  className={`cursor-pointer px-2 py-1 font-mono text-xs ${index === activeSuggestion ? "bg-slate-100" : ""}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => acceptSuggestion(directory)}
                >
                  {directory.path}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-md border p-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
            disabled={!listing?.parent}
            onClick={() => navigate(listing?.parent ?? "")}
          >
            Up
          </button>
          <nav
            aria-label="Folder path"
            className="flex min-w-0 items-center gap-1 overflow-x-auto font-mono text-xs"
          >
            <button
              type="button"
              className="shrink-0 rounded px-1 hover:bg-slate-100"
              onClick={() => navigate("")}
            >
              /
            </button>
            {breadcrumbParts.map((part, index) => {
              const path = breadcrumbParts.slice(0, index + 1).join("/");
              return (
                <span className="flex shrink-0 items-center gap-1" key={path}>
                  <span aria-hidden="true">/</span>
                  <button
                    type="button"
                    className="rounded px-1 hover:bg-slate-100"
                    onClick={() => navigate(path)}
                  >
                    {part}
                  </button>
                </span>
              );
            })}
          </nav>
        </div>
        <p
          className="truncate font-mono text-xs text-slate-600"
          aria-label="Current absolute path"
        >
          {listing?.absolute ?? ""}
        </p>

        {error && <p className="text-red-600">{error}</p>}
        {loading && <p className="text-slate-500">Loading…</p>}

        <ul className="max-h-56 overflow-y-auto">
          {listing?.directories.map((directory) => (
            <li key={directory.absolute}>
              <button
                type="button"
                className="w-full truncate rounded px-2 py-1 text-left hover:bg-slate-100"
                onClick={() => navigate(directory.path)}
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
            onMouseDown={() => {
              skipNextBlur.current = true;
            }}
            onClick={() => {
              const path = queryRef.current.trim();
              if (!path || path === listing?.path) {
                if (listing) onChange(listing.absolute);
                return;
              }
              const revision = queryRevision.current;
              void load(path).then((result) => {
                commitValidated(result, revision);
              });
            }}
          >
            Use this folder
          </button>
        </div>
      </div>
    </div>
  );
}
