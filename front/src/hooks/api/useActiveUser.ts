import { type AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/app/api";
import { type User } from "@/api/schemas";
import { type UserUpdate } from "@/api/user";

export default function useActiveUser({
  onUpdate,
  onLogout,
  onUnauthorized,
  enabled = true,
}: {
  onUpdate?: (user: User) => void;
  onLogout?: () => void;
  onUnauthorized?: (error: AxiosError) => void;
  enabled?: boolean;
} = {}) {
  const client = useQueryClient();

  const query = useQuery<User, AxiosError>({
    queryKey: ["me"],
    queryFn: async () => {
      return await api.user.me();
    },
    retry: 2,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchIntervalInBackground: false,
  });

  const update = useMutation<User, AxiosError, UserUpdate>({
    mutationFn: api.user.update,
    onSuccess: (data) => {
      query.refetch();
      onUpdate?.(data);
    },
  });

  const logout = useMutation<unknown, AxiosError>({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      client.removeQueries({ queryKey: ["me"] });
      onLogout?.();
    },
  });

  const { error } = query;
  if (error != null) {
    if (error?.response?.status === 401) {
      onUnauthorized?.(error);
    }
  }

  return {
    ...query,
    update,
    logout,
  };
}
