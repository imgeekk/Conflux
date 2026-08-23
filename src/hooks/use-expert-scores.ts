import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiExpertScoreWithUser, ApiExpertScoreWithTag } from "@/lib/types";

export function useExpertScoresByTag(tagId: string) {
  return useQuery({
    queryKey: queryKeys.experScores.byTag(tagId),
    queryFn: async () => {
      const res = await fetch(`/api/expert-scores?tagId=${tagId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch expert scores by tag");
      }
      return res.json() as Promise<ApiExpertScoreWithUser[]>;
    },
    enabled: !!tagId,
  });
}
