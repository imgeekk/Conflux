"use client";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useWorkspace } from "@/lib/workspace-context";
import { useWorkspaceMembers, useRemoveMember } from "@/hooks/use-members";
import {
  useWorkspaceInvites,
  useCreateInvite,
  useRevokeInvite,
} from "@/hooks/use-invite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  UsersThreeIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import Loader from "@/components/Loader";
export default function MembersPage() {
  const { data: session } = useSession();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "";
  const currentUserId = session?.user?.id;
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  const { mutate: removeMember } = useRemoveMember(workspaceId);
  const { data: invites = [] } = useWorkspaceInvites(workspaceId);
  const { mutate: createInvite, isPending: creating } =
    useCreateInvite(workspaceId);
  const { mutate: revokeInvite } = useRevokeInvite(workspaceId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState("1");
  const parsedMaxUses = maxUses.trim() === "" ? null : Number(maxUses);
  const maxUsesValid = parsedMaxUses === null || (Number.isInteger(parsedMaxUses) && parsedMaxUses > 0);
  const isOwner = members.some(
    (m) => m.userId === currentUserId && m.role === "OWNER",
  );
  function handleGenerate() {
    if (!maxUsesValid) {
      throw new Error("maxUses must be a positive integer or null");
      return;
    }
    createInvite(
      { maxUses: parsedMaxUses },
      {
        onSuccess: (invite) => {
          const link = `${window.location.origin}/join?code=${invite.code}`;
          navigator.clipboard.writeText(link);
          setCopiedId(invite.id);
        },
      },
    );
  }
  async function handleCopy(inviteId: string, code: string) {
    await navigator.clipboard.writeText(
      `${window.location.origin}/join?code=${code}`,
    );
    setCopiedId(inviteId);
  }
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (!isOwner) {
    return (
      <div className="w-2xl mx-auto pt-16 text-center text-sm text-muted-foreground">
        Only the workspace owner can manage members.
      </div>
    );
  }
  return (
    <div className="w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <UsersThreeIcon className="w-6 h-6 text-chart-2" />
        <h1 className="text-xl font-semibold">Members</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to {workspace?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-2.5">
              {m.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.user.image}
                  alt={m.user.name}
                  className="size-8 rounded-full"
                />
              ) : (
                <div className="size-8 rounded-full bg-chart-2/10 flex items-center justify-center text-xs font-medium">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {m.user.email}
                </p>
              </div>
              {m.role !== "OWNER" && m.userId !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeMember(m.id)}
                  title="Remove member"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              )}
              <span className="text-xs text-muted-foreground">{m.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>Share a link or code to add members</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex w-24 flex-col gap-1">
              <label htmlFor="max-uses" className="text-xs font-medium text-muted-foreground">
                Max uses
              </label>
              <Input
                id="max-uses"
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="∞"
                title="Leave empty for unlimited"
              />
            </div>
            <Button onClick={handleGenerate} disabled={creating || !maxUsesValid}>
              {creating ? (
                <Spinner className="w-3.5 h-3.5" />
              ) : (
                <div className="flex items-center gap-1">
                  <PlusIcon className="w-3.5 h-3.5" />
                  Generate invite link
                </div>
              )}
            </Button>
          </div>

          {invites.length === 0 ? (
            <p className="text-xs text-muted-foreground">No invites yet.</p>
          ) : (
            invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 border border-border p-2"
              >
                <code className="flex-1 text-xs">{inv.code}</code>
                <span className="text-xs text-muted-foreground">
                  {inv.uses}/{inv.maxUses ?? "∞"} used
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(inv.id, inv.code)}
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  {copiedId === inv.id ? "Copied" : "Copy"}
                </Button>
                {!inv.revoked && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeInvite(inv.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
