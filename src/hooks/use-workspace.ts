import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiWorkspace, CreateWorkspaceInput } from "@/lib/types";

export function useWorkspace(userId: string) {
  return useQuery({
    queryKey: queryKeys.workspace.byUser(userId),
    queryFn: async () => {
      const res = await fetch("/api/workspace");
      if (!res.ok) {
        throw new Error("Failed to fetch workspace");
      }
      return res.json() as Promise<ApiWorkspace>;
    },
    enabled: !!userId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create workspace");
      }
      return res.json() as Promise<ApiWorkspace>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.all,
      });
    },
  });
}
