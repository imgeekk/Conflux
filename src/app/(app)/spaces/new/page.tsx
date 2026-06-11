"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace-context";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NewSpacePage() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspace) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, workspaceId: workspace.id }),
    });

    if (res.ok) {
      const space = await res.json();
      router.push(`/spaces/${space.id}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    }
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
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Space name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What kind of knowledge lives here?"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading || !workspace}>
                {loading ? "Creating..." : "Create space"}
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
