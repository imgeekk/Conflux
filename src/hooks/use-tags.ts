import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiTag } from "@/lib/types";

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: async () => {
      const res = await fetch(`/api/tags`);
      if (!res.ok) {
        throw new Error("Failed to fetch tags");
      }
      return res.json() as Promise<ApiTag[]>;
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tag");
      }
      return res.json() as Promise<ApiTag>;
    },
    onMutate: async (newTag) => {
        await queryClient.cancelQueries({
            queryKey: queryKeys.tags.all,
        });
        const previousTags = queryClient.getQueryData<ApiTag[]>(queryKeys.tags.all);
        queryClient.setQueryData(queryKeys.tags.all, (oldTags: ApiTag[] | undefined) => [
            ...(oldTags || []),
            { id: `pending-${Date.now()}`, name: newTag },
        ]);
        return { previousTags };
    },
    onError: (err, newTag, context) => {
        if (context?.previousTags) {
            queryClient.setQueryData(queryKeys.tags.all, context.previousTags);
        }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tags.all,
      });
    },
  });
}
