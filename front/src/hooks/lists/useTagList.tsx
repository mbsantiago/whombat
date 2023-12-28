import { useState } from 'react';
import { type Tag } from "@/api/schemas";

export default function useTagList({
  tags,
  showMax = 20,
}: {
  tags: Tag[];
  showMax?: number;
}) {
  const [search, setSearch] = useState("");
  return {};
}
