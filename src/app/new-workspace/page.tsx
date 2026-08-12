"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/hooks/use-workspace";
import { useJoinWorkspace } from "@/hooks/use-invite";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function NewWorkspacePage() {
  const router = useRouter();
  const {
    mutateAsync: createWorkspace,
    isPending,
    isError,
  } = useCreateWorkspace();

  const [mode, setMode] = useState<"create" | "join">("create");
  const [code, setCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const { mutateAsync: joinWorkspace, isPending: joining, isError: errorWhileJoining } = useJoinWorkspace();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    await createWorkspace({ name });
    router.push("/home");
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError("");
    if (!code.trim()) return;
    try {
    const result = await joinWorkspace(code.trim().toUpperCase());
    if (!result.ok) {
      setJoinError(
        result.workspace
          ? "You're already a member of this workspace."
          : "Invalid or expired invite code.",
      );
      return;
    }
    router.push("/home");
  } catch (err) {
    setJoinError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again.",
    );
  }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            {mode === "create" ? "Create your workspace" : "Join a workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "create"
              ? "This is your team's home in Conflux"
              : "Enter the invite code you received"}
          </p>
        </div>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "create" | "join")}
          className="mb-4"
        >
          <TabsList className="w-full">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="pt-4">
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Workspace name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      required
                      autoFocus
                      placeholder="Acme Inc."
                    />
                  </div>
                  {isError && (
                    <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2">
                      Something went wrong. Please try again.
                    </p>
                  )}
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <Spinner /> : "Create workspace"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="pt-4">
            <Card>
              <CardContent>
                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Invite code
                    </label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      autoFocus
                      placeholder="e.g. 8XK2Q9AB"
                      className="uppercase tracking-widest"
                    />
                  </div>
                  {joinError && (
                    <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2">
                      {joinError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={joining || !code.trim()}
                    className="w-full"
                  >
                    {joining ? <Spinner /> : "Join workspace"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
