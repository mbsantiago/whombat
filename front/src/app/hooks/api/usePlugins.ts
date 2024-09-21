import api from "@/app/api";
import { useQuery } from "@tanstack/react-query";

export default function usePlugins() {
  const query = useQuery({
    queryKey: ["plugins"],
    queryFn: api.plugins.get,
  });

  return {
    items: query.data,
    total: query.data?.length,
    query,
  };
}
