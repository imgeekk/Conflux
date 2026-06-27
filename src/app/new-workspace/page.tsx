"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/hooks/use-workspace";

export default function NewWorkspacePage() {
  const router = useRouter();
  const {
    mutateAsync: createWorkspace,
    isPending,
    isError,
  } = useCreateWorkspace();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    await createWorkspace({ name });
    router.push("/home");
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Create your workspace
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            This is your team's home in Conflux
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600">
                Workspace name
              </label>
              <input
                type="text"
                name="name"
                required
                autoFocus
                className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="Acme Inc."
              />
            </div>
            {isError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive rounded-lg px-3 py-2">
                Something went wrong. Please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="bg-neutral-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create workspace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
