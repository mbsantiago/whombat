import createAPI from "@/lib/api";

const baseURL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_BACKEND_HOST || ""
    : "";

const api = createAPI({
  baseURL,
  withCredentials: true,
});

export default api;
