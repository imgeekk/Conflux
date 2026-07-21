import { ApiQuestionWithAnswers } from "@/lib/types";
import { queryKeys } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export function useRetryAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      const res = await fetch(`/api/questions/${questionId}/retry`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Retry failed");
      return res.json() as Promise<ApiQuestionWithAnswers>;
    },
    onSuccess: (question) => {
      queryClient.setQueryData<ApiQuestionWithAnswers[]>(
        queryKeys.questions.bySpace(question.spaceId),
        (old) => old?.map((q) => (q.id === question.id ? question : q)) ?? [],
      );
    },
  });
}
