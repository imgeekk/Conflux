import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ApiAnswer,
  ApiQuestionWithAnswers,
  CreateAnswerInput,
  UpdateAnswerInput,
} from "@/lib/types";

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: queryKeys.questions.byId(questionId),
    queryFn: async () => {
      const res = await fetch(`/api/questions/${questionId}/`);
      if (!res.ok) {
        throw new Error("Failed to fetch the question");
      }
      return res.json() as Promise<ApiQuestionWithAnswers>;
    },
  });
}

export function useEditAnswer(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAnswerInput) => {
      const res = await fetch(`/api/answers/${input.answerId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error("Error while updating the answer");
      }
      return res.json() as Promise<ApiAnswer>;
    },
    onSuccess: (answer) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.questions.byId(answer.questionId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.questions.bySpace(spaceId),
        });
    },
  });
}

export function useCreateAnswer(questionId: string, spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAnswerInput) => {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error("Error while creating an answer");
      }
      return res.json() as Promise<ApiAnswer>;
    },
    onSuccess: (answer) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.byId(answer.questionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.bySpace(spaceId),
      });
    },
  });
}

export function useAcceptAnswer(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: string) => {
      const res = await fetch(`/api/answers/${answerId}/accept/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Error while accepting the answer");
      }
      return res.json() as Promise<ApiAnswer>;
    },
    onSuccess: (answer) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.byId(answer.questionId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.questions.bySpace(spaceId),
      });
    },
  });
}
