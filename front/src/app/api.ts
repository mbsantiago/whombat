import createAPI from "@/api";

const baseURL = process.env.NEXT_PUBLIC_WHOMBAT_BACKEND_URL || "http://localhost:5000";

const api = createAPI({
  baseURL,
  withCredentials: true,
});

export default api;
