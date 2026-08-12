"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJoinWorkspace } from "@/hooks/use-invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import Loader from "@/components/Loader";
function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [error, setError] = useState("");
  const { mutateAsync: joinWorkspace, isPending: joining } = useJoinWorkspace();
  const { data: session, isPending: sessionPending } = useSession();

  useEffect(() => {
    if (sessionPending || session) return;
    const callback = `/join?code=${encodeURIComponent(code)}`;
    router.replace(`/signup?callbackURL=${encodeURIComponent(callback)}`);
  }, [session, sessionPending, code, router]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!code.trim()) return;
    const result = await joinWorkspace(code.trim().toUpperCase());
    if (!result.ok) {
      setError(
        result.workspace
          ? "You're already a member of this workspace."
          : "Invalid or expired invite code.",
      );
      return;
    }
    router.push("/home");
  }

  if (sessionPending || !session) {
    <div className="min-h-screen flex items-center justify-center px-4">
      <Loader />
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Invite code
        </label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. 8XK2Q9AB"
          required
          autoFocus
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={joining || !code.trim()}>
        {joining ? "Joining..." : "Join workspace"}
      </Button>
    </form>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">
          Join a workspace
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter the invite code you received.
        </p>
        <Suspense fallback={null}>
          <JoinForm />
        </Suspense>
      </div>
    </div>
  );
}
