import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiMember } from "@/lib/types";

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.members.byWorkspace(workspaceId),
    queryFn: async () => {
      const res = await fetch(`/api/members/?workspaceId=${workspaceId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch members");
      }
      return res.json() as Promise<ApiMember[]>;
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.byWorkspace(workspaceId),
      });
    },
  });
}
