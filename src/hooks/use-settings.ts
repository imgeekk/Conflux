import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useSettings(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.settings.all,
        queryFn: async () => {
            const res = await fetch(`/api/workspace/${workspaceId}/settings`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch settings");
            }
            return res.json() as Promise<{ id: string; name: string; hasApiKey: boolean, isOwner: boolean }>;
        }
    })
}

export function useUpdateSettings(workspaceId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updatedSettings: { apiKey: string | null }) => {
            const res = await fetch(`/api/workspace/${workspaceId}/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedSettings),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update settings");
            }
            return res.json() as Promise<{ hasApiKey: boolean }>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
        }
    })
}