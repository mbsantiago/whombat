import { useQuery } from "@tanstack/react-query";

import api from "@/app/api";

export default function usePlugins() {
  const query = useQuery(["plugins"], api.plugins.get);

  return {
    items: query.data,
    total: query.data?.length,
    query,
  };
}
