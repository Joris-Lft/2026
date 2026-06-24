import { useQuery } from "@tanstack/react-query";
import { getUserDirectory } from "@/services/users";

export function usersQueryKey() {
  return ["users", "directory"] as const;
}

export function useUserDirectory() {
  return useQuery({
    queryKey: usersQueryKey(),
    queryFn: getUserDirectory,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvitees(excludeUserId?: string) {
  return useQuery({
    queryKey: usersQueryKey(),
    queryFn: getUserDirectory,
    staleTime: 5 * 60 * 1000,
    select: (directory) =>
      excludeUserId
        ? directory.users.filter((user) => user.id !== excludeUserId)
        : directory.users,
  });
}
