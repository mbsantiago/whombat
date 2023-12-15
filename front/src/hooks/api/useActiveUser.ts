import { type AxiosError, isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type User } from "@/api/schemas";

export default function useActiveUser({
  user,
  onUpdate,
  onLogout,
  onUnauthorized,
  enabled = true,
}: {
  user?: User;
  onUpdate?: (user: User) => void;
  onLogout?: () => void;
  onUnauthorized?: (error: AxiosError) => void;
  enabled?: boolean;
} = {}) {
  const client = useQueryClient();

  const query = useQuery(
    ["me"],
    async () => {
      return await api.user.me();
    },
    {
      initialData: user,
      staleTime: 1000 * 60 * 5,
      retry: 2,
      enabled,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchIntervalInBackground: false,
      onError: (error: Error | AxiosError) => {
        if (!isAxiosError(error)) {
          return;
        }

        if (error?.response?.status === 401) {
          onUnauthorized?.(error);
        }
      },
    },
  );

  const update = useMutation({
    mutationFn: api.user.update,
    onSuccess: (data) => {
      query.refetch();
      onUpdate?.(data);
    },
  });

  const logout = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      client.invalidateQueries(["me"]);
      onLogout?.();
    },
  });

  return {
    ...query,
    update,
    logout,
  } as const;
}
