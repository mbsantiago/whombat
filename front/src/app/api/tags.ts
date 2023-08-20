import axios from "axios";
import { BASE_ROUTE } from "./common";

type GetManyQuery = {
  limit?: number;
  offset?: number;
};

async function getTags({ limit, offset }: GetManyQuery) {
  const response = await axios.get(`${BASE_ROUTE}/tags`, {
    params: {
      limit,
      offset,
    },
  });
  return response.data;
}

interface TagCreate {
  name: string;
  key: string;
}

interface Tag extends TagCreate {
  id: number;
}

async function createTag({ name, key }: TagCreate): Promise<Tag[]> {
  const response = await axios.post(`${BASE_ROUTE}/tags`, {
    name,
    key,
  });
  return response.data;
}

export { getTags, createTag };
