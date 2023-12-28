import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { useCallback, useEffect } from "react";

export function useObjectDestruction<T>({
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
  mutationFn: (obj: T) => Promise<T>;
  name: string;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}): ReturnType<typeof useMutation<T, AxiosError>> {
  const { status, data } = query;

  const trueMutationFn = useCallback(async () => {
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

    return await mutationFn(data);
  }, [status, data, mutationFn, name, uuid]);

  return useMutation<T, AxiosError>({
    mutationFn: trueMutationFn,
    onSuccess: (data) => {
      client.removeQueries({
        queryKey: [name, uuid],
      });
      onSuccess?.(data);
    },
    onError: onError,
  });
}

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

  return useMutation<T, AxiosError, K>({
    mutationFn: trueMutationFn,
    onSuccess: (data) => {
      client.setQueryData([name, uuid], data);
      onSuccess?.(data);
    },
    onError: onError,
  });
}

export function useObjectQuery<T, K>({
  uuid,
  query,
  queryFn,
  name,
  secondaryName,
  enabled = false,
}: {
  uuid: string;
  query: ReturnType<typeof useQuery<T>>;
  queryFn: (obj: T) => Promise<K>;
  name: string;
  secondaryName: string;
  enabled?: boolean;
}) {
  const { status, data } = query;

  const trueQueryFn = useCallback(async () => {
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
    return await queryFn(data);
  }, [status, data, queryFn, name, uuid]);

  return useQuery<K, AxiosError>({
    queryFn: trueQueryFn,
    queryKey: [name, uuid, secondaryName],
    enabled: status !== "pending" && status !== "error" && enabled,
  });
}

export type UseObjectProps<T> = {
  uuid: string;
  name: string;
  enabled?: boolean;
  getFn: (uuid: string) => Promise<T>;
  onError?: (error: AxiosError) => void;
};

export default function useObject<T>({
  uuid,
  initial,
  name,
  enabled = true,
  getFn,
  onError,
}: {
  initial?: T;
} & UseObjectProps<T>) {
  const client = useQueryClient();

  const query = useQuery<T, AxiosError>({
    queryKey: [name, uuid],
    queryFn: async () => await getFn(uuid),
    retry: (failureCount, error) => {
      if (error == null) {
        return failureCount < 3;
      }

      const status = error?.response?.status;
      if (status == null) {
        return failureCount < 3;
      }

      // Should not retry on any of the 4xx errors
      if (status >= 400 && status < 500) {
        return false;
      }

      return failureCount < 3;
    },
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

  const { error, isError } = query;
  useEffect(() => {
    if (isError) {
      onError?.(error);
    }
  }, [error, isError, onError]);

  return {
    query,
    client,
    set,
    useQuery: ({
      queryFn,
      name: secondaryName,
      enabled = false,
    }: {
      name: string;
      queryFn: (obj: T) => Promise<T>;
      enabled?: boolean;
    }) => {
      return useObjectQuery({
        uuid,
        query,
        queryFn,
        secondaryName,
        name,
        enabled,
      });
    },
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
    useDestruction: ({
      mutationFn,
      onSuccess,
      onError,
    }: {
      mutationFn: (data: T) => Promise<T>;
      onSuccess?: (data: T) => void;
      onError?: (error: AxiosError) => void;
    }) => {
      return useObjectDestruction({
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
