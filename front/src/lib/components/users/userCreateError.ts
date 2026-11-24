import type { AxiosError } from "axios";

export function userCreateErrorMessage(error: AxiosError): string {
  const detail = (error.response?.data as { detail?: unknown } | undefined)
    ?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "msg" in item &&
        typeof item.msg === "string"
          ? item.msg
          : null,
      )
      .filter((message): message is string => message !== null);
    if (messages.length) return messages.join("; ");
  }
  return error.response?.status
    ? `Request failed (${error.response.status})`
    : "Could not connect to the server.";
}
