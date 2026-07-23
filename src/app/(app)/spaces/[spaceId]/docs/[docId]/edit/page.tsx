"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { TipTapEditor } from "@/components/tiptap-editor";
import { useDocument, useUpdateDocument } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { Spinner } from "@/components/ui/spinner";

export default function EditDocPage() {
  const router = useRouter();
  const { spaceId, docId } = useParams<{ spaceId: string; docId: string }>();
  const { data: doc, isLoading } = useDocument(docId);
  const { mutate: updateDoc, isPending } = useUpdateDocument(docId);

  const [changed, setChanged] = useState(false);
  const contentRef = useRef<string>("");

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!changed) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const currentContent = contentRef.current || doc?.content || "";
    if (!title.trim()) return;
    if (title === doc?.title && currentContent === doc?.content) return;
    updateDoc(
      {
        title: title.trim(),
        ...(currentContent !== doc?.content && { content: currentContent }),
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
    return <div className="h-full overflow-y-auto"><div className="max-w-4xl mx-auto">Document not found</div></div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
      <Link
        href={`/spaces/${spaceId}/docs/${docId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to document
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          defaultValue={doc.title}
          onChange={() => setChanged(true)}
          placeholder="Add document title"
          required
          className="text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 w-full"
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

        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={isPending || !changed}
            className="w-26"
          >
            {isPending ? <Spinner /> : "Save changes"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/spaces/${spaceId}/docs/${docId}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
