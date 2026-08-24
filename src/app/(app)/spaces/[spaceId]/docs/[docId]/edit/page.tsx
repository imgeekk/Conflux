"use client";

import { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { TipTapEditor } from "@/components/tiptap-editor";
import { useDocument, useUpdateDocument } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { Spinner } from "@/components/ui/spinner";
import { TagPicker } from "@/components/TagPicker";

export default function EditDocPage() {
  const router = useRouter();
  const { spaceId, docId } = useParams<{ spaceId: string; docId: string }>();
  const { data: doc, isLoading } = useDocument(docId);
  const { mutate: updateDoc, isPending } = useUpdateDocument(docId);

  const [changed, setChanged] = useState(false);
  const contentRef = useRef<string>("");

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    ((doc as any)?.tags ?? []).map((t: any) => t.id),
  );

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!changed) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const currentContent = contentRef.current || doc?.content || "";
    if (!title.trim()) return;
    if (
      title === doc?.title &&
      currentContent === doc?.content &&
      JSON.stringify(selectedTagIds) === JSON.stringify(((doc as any)?.tags ?? []).map((t: any) => t.id))
    ) return;
    updateDoc(
      {
        title: title.trim(),
        ...(currentContent !== doc?.content && { content: currentContent }),
        tagIds: selectedTagIds,
      },
      { onSuccess: () => router.push(`/spaces/${spaceId}/docs/${docId}`) },
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto">Document not found</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto">
        <Link
          href={`/spaces/${spaceId}/docs/${docId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to document
        </Link>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            name="title"
            defaultValue={doc.title}
            onChange={() => setChanged(true)}
            placeholder="Add document title"
            required
            className="text-3xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 w-full"
            autoFocus
          />

          <TipTapEditor
            content={doc.content ?? ""}
            onChange={(json) => {
              contentRef.current = json;
              setChanged(true);
            }}
            placeholder="Write your document..."
          />

          <div className="border-t border-border pt-4">
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">
              Tags
            </label>
            <TagPicker
              selectedIds={selectedTagIds}
              onChange={(ids) => {
                setSelectedTagIds(ids);
                setChanged(true);
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button variant="ghost" asChild className="flex-1 sm:flex-none">
              <Link href={`/spaces/${spaceId}/docs/${docId}`}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending || !changed}
              className="flex-1 sm:flex-none sm:w-28"
            >
              {isPending ? <Spinner /> : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
