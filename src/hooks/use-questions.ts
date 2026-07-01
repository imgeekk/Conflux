import { ApiQuestion, CreateQuestionInput } from "@/lib/types";
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
            return res.json() as Promise<ApiQuestion[]>;
        },
        enabled: !!spaceId,
    })
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
                throw new Error( "Failed to create question");
            }
            return res.json() as Promise<ApiQuestion>;
        },
        onSuccess: (question) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.questions.bySpace(question.spaceId) });
        }
    })
}

export function useUpdateQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: { id: string } & Partial<CreateQuestionInput>) => {
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
            queryClient.invalidateQueries({ queryKey: queryKeys.questions.bySpace(question.spaceId) });
        }
    })
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
        }
    });
}