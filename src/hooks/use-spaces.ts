import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiSpace, CreateSpaceInput } from "@/lib/types";

export function useSpaces(workspaceId: string, initialSpaces?: ApiSpace[]) {
  return useQuery({
    queryKey: queryKeys.spaces.byWorkspace(workspaceId),
    queryFn: async () => {
      const res = await fetch(`/api/spaces?workspaceId=${workspaceId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch spaces");
      }
      return res.json() as Promise<ApiSpace[]>;
    },
    initialData: initialSpaces,
    enabled: !!workspaceId,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpaceInput) => {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create space");
      }
      return res.json() as Promise<ApiSpace>;
    },
    onSuccess: (space) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.spaces.byWorkspace(space.workspaceId),
      });
    },
  });
}
