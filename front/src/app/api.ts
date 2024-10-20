import createAPI from "@/lib/api";

const api = createAPI({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_HOST}`,
  withCredentials: true,
});

export default api;
