import {
  ApiQuestion,
  ApiQuestionWithAnswers,
  CreateQuestionInput,
} from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useQuestions(spaceId: string) {
  return useQuery({
    queryKey: queryKeys.questions.bySpace(spaceId),
    queryFn: async () => {
      const res = await fetch(`/api/questions?spaceId=${spaceId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch questions");
      }
      return res.json() as Promise<ApiQuestionWithAnswers[]>;
    },
    enabled: !!spaceId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error("Failed to create question");
      }
      return res.json() as Promise<ApiQuestionWithAnswers>;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.questions.bySpace(input.spaceId),
      });
      const previous = queryClient.getQueryData<ApiQuestionWithAnswers[]>(
        queryKeys.questions.bySpace(input.spaceId),
      );
      const optimistic: ApiQuestionWithAnswers & { id: string } = {
        id: `pending-${Date.now()}`,
        text: input.text,
        spaceId: input.spaceId,
        authorId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: { id: "", name: "You", image: null },
        answers: [],
      };
      queryClient.setQueryData(queryKeys.questions.bySpace(input.spaceId), [
        optimistic,
        ...(previous ?? []),
      ]);
      return { previous };
    },
    onError: (_err, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.questions.bySpace(input.spaceId),
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.bySpace(input.spaceId),
      });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: { id: string } & Partial<CreateQuestionInput>,
    ) => {
      const { id, ...rest } = input;
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      });
      if (!res.ok) {
        throw new Error("Failed to update question");
      }
      return res.json() as Promise<ApiQuestion>;
    },
    onSuccess: (question) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.bySpace(question.spaceId),
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete question");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}
