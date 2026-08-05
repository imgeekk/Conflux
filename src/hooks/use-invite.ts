import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiInvite } from "@/lib/types";

export function useWorkspaceInvites(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.invites.byWorkspace(workspaceId),
    queryFn: async () => {
      const res = await fetch(`/api/invites?workspaceId=${workspaceId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch invites");
      }
      return res.json() as Promise<ApiInvite[]>;
    },
  });
}

export function useCreateInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      expiresAt,
      maxUses,
    }: {
      expiresAt?: string;
      maxUses?: number;
    }) => {
      const res = await fetch(`/api/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, expiresAt, maxUses }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invite");
      }
      return res.json() as Promise<ApiInvite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invites.byWorkspace(workspaceId),
      });
    },
  });
}

export function useValidateInvite() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/invites/validate?code=${code}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to validate invite");
      }
      return res.json() as Promise<ApiInvite>;
    },
  });
}

export function useJoinWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/invites/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join workspace");
      }
      return res.json() as Promise<{
        ok: boolean;
        alreadyMember?: boolean;
        workspace?: { id: string; name: string };
      }>;
    },
  });
}

export function useRevokeInvite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/invites/${inviteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke invite");
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.invites.byWorkspace(workspaceId),
      });
    },
  });
}
