import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback, useEffect } from "react";
import type { SetStateAction } from "react";

type UseObjectDestructionProps<T> = {
  /** The mutation function to execute for deleting the object. */
  mutationFn: (data: T) => Promise<T>;
} & Omit<Parameters<typeof useMutation<T, AxiosError>>[0], "mutationFn">;

/**
 * @function useObjectDestruction
 * @template T The type of the object data.
 *
 * A custom React Query hook to handle object destruction (deletion) logic.
 *
 * This hook provides a convenient way to delete an object and then invalidate
 * its associated query in the React Query cache. It ensures that the mutation
 * is only executed when the query has successfully fetched the object data.
 *
 * @throws {Error}
 *   - If the query status is 'pending' (object data not yet fetched) or
 *   'error' (error during fetching).
 */
export function useObjectDestruction<T>({
  id,
  query,
  client,
  name,
  mutationFn,
  onSuccess,
  ...rest
}: {
  id: string;
  query: ReturnType<typeof useQuery<T, AxiosError>>;
  client: ReturnType<typeof useQueryClient>;
  name: string;
} & UseObjectDestructionProps<T>): ReturnType<
  typeof useMutation<T, AxiosError>
> {
  const { status, data } = query;

  const trueMutationFn = useCallback(async () => {
    if (status === "pending") {
      throw new Error(
        `No data for object of type ${name} (id=${id}). ` +
          "Either the query is not enabled or the query is still loading.",
      );
    }

    if (status === "error") {
      throw new Error(
        `Error while loading object of type ${name} (id=${id}), cannot mutate`,
      );
    }

    return await mutationFn(data);
  }, [status, data, mutationFn, name, id]);

  return useMutation<T, AxiosError, void>({
    ...rest,
    mutationFn: trueMutationFn,
    onSuccess: (data, variables, context) => {
      client.removeQueries({
        queryKey: [name, id],
      });
      onSuccess?.(data, variables, context);
    },
  });
}

type UseObjectMutationProps<T, K, J = T> = {
  /** Whether to automatically update the cached object data after the
   * mutation. Only set this to `true` if the mutation function returns the
   * updated object data.
   */
  withUpdate?: boolean;
  /** The mutation function to execute. */
  mutationFn: (obj: T, extra: K) => Promise<J>;
} & Omit<Parameters<typeof useMutation<J, AxiosError, K>>[0], "mutationFn">;

/**
 * @function useObjectMutation
 * @template T The type of the object data.
 * @template K The type of the additional data passed to the mutation function.
 * @template J The type of the mutation result (defaults to T).
 *
 * A custom React Query hook to handle mutations (updates) on an object.
 *
 * This hook provides a convenient way to update an object in your React Query
 * cache. It ensures that the mutation is only executed when the object data is
 * available from the corresponding `useQuery` hook. Additionally, it can
 * automatically update the cached object data after the mutation is
 * successful.
 *
 * @throws {Error}
 *   - If the query status is 'pending' (object data not yet fetched) or
 *   'error' (error during fetching).
 *   - If the object data is null (no object found).
 */
export function useObjectMutation<T, K, J = T>({
  id,
  data,
  name,
  status,
  client,
  withUpdate = true,
  mutationFn,
  onSuccess,
  ...rest
}: {
  id: string;
  data?: T;
  name: string;
  status: string;
  client: ReturnType<typeof useQueryClient>;
} & UseObjectMutationProps<T, K, J>): ReturnType<
  typeof useMutation<J, AxiosError, K>
> {
  const trueMutationFn = useCallback(
    async (extra: K) => {
      if (status === "pending") {
        throw new Error(
          `No data for object of type ${name} (id=${id}). ` +
            "Either the query is not enabled or the query is still loading.",
        );
      }

      if (status === "error") {
        throw new Error(
          `Error while loading object of type ${name} (id=${id}),` +
            ` cannot mutate`,
        );
      }

      if (data == null) {
        throw new Error(
          `No data for object of type ${name} (id=${id}). ` +
            "The object is null, cannot mutate",
        );
      }

      return await mutationFn(data, extra);
    },
    [status, data, mutationFn, name, id],
  );

  return useMutation<J, AxiosError, K>({
    ...rest,
    mutationFn: trueMutationFn,
    onSuccess: (data, variables, context) => {
      if (withUpdate) {
        client.setQueryData([name, id], data);
      }
      onSuccess?.(data, variables, context);
    },
  });
}

type UseRelatedObjectQueryProps<T, K> = {
  /** A unique name for the related object query. */
  secondaryName: string;
  /** Whether the query is enabled by default. Set this to `true` to fetch the
   * related data immediately when the primary object is available.
   */
  enabled?: boolean;
  /** The query function to fetch the related object data. */
  queryFn: (obj: T) => Promise<K>;
} & Omit<
  Parameters<typeof useQuery<K, AxiosError, T>>[0],
  "queryFn" | "queryKey"
>;

/**
 * @template T The type of the main object data.
 * @template K The type of the related object data to be fetched.
 *
 * A custom React Query hook to fetch related data based on a primary object
 * query.
 *
 * This hook is designed to be used in conjunction with another `useQuery` hook
 * that fetches the primary object data. It enables you to efficiently fetch
 * additional data related to the primary object, while ensuring that the query
 * only runs when the primary object data is available and there are no errors.
 *
 * @throws {Error}
 *   - If the query status for the primary object is 'pending' (object data not
 *   yet fetched) or 'error' (error during fetching).
 */
export function useObjectQuery<T, K>({
  id,
  query,
  name,
  secondaryName,
  enabled = false,
  queryFn,
  ...rest
}: {
  /** The ID of the primary object. */
  id: string;
  /** The result of the `useQuery` hook for the primary object. */
  query: ReturnType<typeof useQuery<T>>;
  /** A unique name for the primary object query. */
  name: string;
} & UseRelatedObjectQueryProps<T, K>) {
  const { status, data } = query;

  const trueQueryFn = useCallback(async () => {
    if (status === "pending") {
      throw new Error(
        `No data for object of type ${name} (id=${id}). ` +
          "Either the query is not enabled or the query is still loading.",
      );
    }

    if (status === "error") {
      throw new Error(
        `Error while loading object of type ${name} (id=${id}), cannot mutate`,
      );
    }
    return await queryFn(data);
  }, [status, data, queryFn, name, id]);

  return useQuery<K, AxiosError, T>({
    ...rest,
    queryFn: trueQueryFn,
    queryKey: [name, id, secondaryName],
    enabled: status !== "pending" && status !== "error" && enabled,
  });
}

/**
 * Options for the `useObject` hook.
 * @template T The type of the object data.
 */
export type UseObjectProps<T> = {
  /** The unique identifier of the object. */
  id: string;
  /** A unique name for the object query (used for caching and invalidation). */
  name: string;
  /** Whether to enable the query by default. */
  enabled?: boolean;
  /** The function to fetch the object data, given the ID. */
  queryFn: (id: string) => Promise<T>;
  /** An optional error handler callback. */
  onError?: (error: AxiosError) => void;
} & Omit<Parameters<typeof useQuery<T, AxiosError>>[0], "queryFn" | "queryKey">;

/**
 * The result of the `useObject` hook.
 * @template T The type of the object data.
 */
export type ObjectQuery<T> = {
  /** The result of the main `useQuery` hook for fetching the object. */
  query: ReturnType<typeof useQuery<T, AxiosError>>;
  /** The React Query client instance. */
  client: ReturnType<typeof useQueryClient>;
  /** A function to manually update the cached object data. */
  setData: (data: SetStateAction<T>) => void;
  /** A helper hook to create a mutation for updating the object. */
  useMutation: <K, J = T>(
    props: UseObjectMutationProps<T, K, J>,
  ) => ReturnType<typeof useMutation<J, AxiosError, K>>;
  /** A helper hook to create a query for fetching related data. */
  useQuery: <K>(
    props: UseRelatedObjectQueryProps<T, K>,
  ) => ReturnType<typeof useQuery<K, AxiosError, T>>;
  /** A helper hook to create a mutation for deleting the object. */
  useDestruction: (
    props: UseObjectDestructionProps<T>,
  ) => ReturnType<typeof useMutation<T, AxiosError>>;
};

/**
 * A custom React Query hook to fetch and manage the state of a single object.
 *
 * This hook simplifies the process of working with object data in your
 * application by combining common React Query operations into a single
 * interface. It handles fetching the object, updating its data, performing
 * mutations, fetching related data, and even deleting the object.
 *
 * @function useObject
 * @template T The type of the object data.
 */
export default function useObject<T>({
  id,
  name,
  enabled = true,
  queryFn,
  onError,
  staleTime = Infinity,
  ...rest
}: UseObjectProps<T>): ObjectQuery<T> {
  const client = useQueryClient();

  const query = useQuery<T, AxiosError>({
    queryKey: [name, id],
    queryFn: () => queryFn(id),
    enabled,
    staleTime,
    ...rest,
  });

  const setData = useCallback(
    (data: SetStateAction<T>) => {
      client.setQueryData([name, id], data);
    },
    [client, id, name],
  );

  const { data, status, error, isError } = query;

  // Handle errors if needed
  useEffect(() => {
    if (isError) {
      onError?.(error);
    }
  }, [error, isError, onError]);

  const useRelatedMutation = <K, J = T>({
    mutationFn,
    withUpdate = true,
    ...rest
  }: UseObjectMutationProps<T, K, J>) => {
    return useObjectMutation({
      id,
      data,
      status,
      client,
      mutationFn,
      name,
      withUpdate,
      ...rest,
    });
  };

  const useRelatedQuery = <K>({
    queryFn,
    secondaryName,
    enabled = false,
    ...rest
  }: UseRelatedObjectQueryProps<T, K>) => {
    return useObjectQuery({
      id: id,
      query,
      queryFn,
      secondaryName,
      name,
      enabled,
      ...rest,
    });
  };

  const useDestruction = ({
    mutationFn,
    ...rest
  }: UseObjectDestructionProps<T>) => {
    return useObjectDestruction({
      id: id,
      query,
      client,
      mutationFn,
      name,
      ...rest,
    });
  };

  return {
    query,
    client,
    setData,
    useMutation: useRelatedMutation,
    useQuery: useRelatedQuery,
    useDestruction,
  };
}

// retry: (failureCount, error) => {
//   if (error == null) {
//     return failureCount < 3;
//   }
//
//   const status = error?.response?.status;
//   if (status == null) {
//     return failureCount < 3;
//   }
//
//   // Should not retry on any of the 4xx errors
//   if (status >= 400 && status < 500) {
//     return false;
//   }
//
//   return failureCount < 3;
// },
// initialData,
// staleTime: 1000 * 60 * 5,
