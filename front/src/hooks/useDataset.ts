import { notFound, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/app/api";

export default function useDataset() {
  const params = useSearchParams();
  const uuid = params.get("uuid");
  if (!uuid) {
    notFound();
  }
  return useQuery(["dataset", uuid], () => api.datasets.get(uuid));
}
