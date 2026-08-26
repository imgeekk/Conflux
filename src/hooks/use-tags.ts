import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiTag } from "@/lib/types";

export function useTags(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.tags.all(workspaceId),
    queryFn: async () => {
      const res = await fetch(`/api/tags?workspaceId=${workspaceId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tags");
      }
      return res.json() as Promise<ApiTag[]>;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateTag(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, workspaceId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tag");
      }
      return res.json() as Promise<ApiTag>;
    },
    onMutate: async (newTag) => {
        await queryClient.cancelQueries({
            queryKey: queryKeys.tags.all(workspaceId),
        });
        const previousTags = queryClient.getQueryData<ApiTag[]>(queryKeys.tags.all(workspaceId));
        queryClient.setQueryData(queryKeys.tags.all(workspaceId), (oldTags: ApiTag[] | undefined) => [
            ...(oldTags || []),
            { id: `pending-${Date.now()}`, name: newTag },
        ]);
        return { previousTags };
    },
    onError: (err, newTag, context) => {
        if (context?.previousTags) {
            queryClient.setQueryData(queryKeys.tags.all(workspaceId), context.previousTags);
        }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tags.all(workspaceId),
      });
    },
  });
}
