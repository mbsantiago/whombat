import { type AxiosError } from "axios";
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useObjectMutation<T, K>({
  uuid,
  query,
  client,
  mutationFn,
  name,
  onSuccess,
  onError,
}: {
  uuid: string;
  query: ReturnType<typeof useQuery<T>>;
  client: ReturnType<typeof useQueryClient>;
  mutationFn: (obj: T, extra: K) => Promise<T>;
  name: string;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}): ReturnType<typeof useMutation<T, AxiosError, K>> {
  const { status, data } = query;

  const trueMutationFn = useCallback(
    async (extra: K) => {
      if (status === "pending") {
        throw new Error(
          `No data for object of type ${name} (uuid=${uuid}). ` +
            "Either the query is not enabled or the query is still loading.",
        );
      }

      if (status === "error") {
        throw new Error(
          `Error while loading object of type ${name} (uuid=${uuid}), cannot mutate`,
        );
      }

      return await mutationFn(data, extra);
    },
    [status, data, mutationFn, name, uuid],
  );

  const mutation = useMutation<T, AxiosError, K>({
    mutationFn: trueMutationFn,
    onSuccess: (data) => {
      client.setQueryData([name, uuid], data);
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return mutation;
}

export default function useObject<T>({
  uuid,
  initial,
  name,
  enabled = true,
  getFn,
}: {
  uuid: string;
  initial?: T;
  name: string;
  enabled: boolean;
  getFn: (uuid: string) => Promise<T>;
}) {
  const client = useQueryClient();

  const query = useQuery<T, AxiosError>({
    queryKey: [name, uuid],
    queryFn: async () => await getFn(uuid),
    initialData: initial,
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  const set = useCallback(
    (data: T) => {
      client.setQueryData([name, uuid], data);
    },
    [client, uuid, name],
  );

  return {
    query,
    client,
    set,
    useMutation: <K>({
      mutationFn,
      onSuccess,
      onError,
    }: {
      mutationFn: (data: T, extra: K) => Promise<T>;
      onSuccess?: (data: T) => void;
      onError?: (error: AxiosError) => void;
    }) => {
      return useObjectMutation({
        uuid,
        query,
        client,
        mutationFn,
        name,
        onSuccess,
        onError,
      });
    },
  };
}