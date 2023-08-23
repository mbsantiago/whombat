import createAPI from "@/api";

const api = createAPI({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

export default api;
