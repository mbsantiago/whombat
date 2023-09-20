import { type AxiosError, isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type User } from "@/api/user";

export default function useActiveUser({
  onUpdate,
  onLogout,
  onUnauthorized,
}: {
  onUpdate?: (user: User) => void;
  onLogout?: () => void;
  onUnauthorized?: (error: AxiosError) => void;
} = {}) {
  const client = useQueryClient();

  const user = useQuery(
    ["me"],
    async () => {
      return await api.user.me();
    },
    {
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
      user.refetch();
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
    ...user,
    update,
    logout,
  };
}
