"use client";

import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSpace } from "@/hooks/use-spaces";

export default function Page() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const {
    mutate: createSpace,
    isPending,
    isError,
  } = useCreateSpace();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspace) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    createSpace(
      { workspaceId: workspace.id, name, description },
      {
        onSuccess: (space) => {
          router.push(`/spaces/${space.id}`);
        },
        onError: (error) => {
          console.error("Failed to create space:", error);
        },
      }
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/home"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Create a space
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spaces organise your team's knowledge by topic or team.
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Space name
              </label>
              <Input
                type="text"
                name="name"
                required
                autoFocus
                placeholder="e.g. Engineering, Product, Operations"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                name="description"
                rows={3}
                placeholder="What kind of knowledge lives here?"
              />
            </div>
            {isError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive px-3 py-2">
                {isError || "Failed to create space. Please try again."}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={isPending || !workspace}>
                {isPending ? "Creating..." : "Create space"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/home">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
