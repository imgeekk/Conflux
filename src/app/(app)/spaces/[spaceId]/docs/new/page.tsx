"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { ArrowLeftIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { TipTapEditor } from "@/components/tiptap-editor"
import { useCreateDocument } from "@/hooks/use-documents"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner";
import { TagPicker } from "@/components/TagPicker";

export default function NewDocPage() {
  const router = useRouter()
  const { spaceId } = useParams<{ spaceId: string }>()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const { mutate: createDoc, isPending } = useCreateDocument()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createDoc(
      { title, content, spaceId, tagIds: selectedTagIds },
      { onSuccess: () => router.push(`/spaces/${spaceId}`) },
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/spaces/${spaceId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to space
      </Link>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add document title"
          required
          className="text-3xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 w-full"
          autoFocus
        />

        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Write your document..."
        />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 pt-1">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Tags
            </label>
            <TagPicker
              selectedIds={selectedTagIds}
              onChange={setSelectedTagIds}
            />
          </div>
          <div className="flex gap-3 shrink-0 sm:mt-6.5">
            <Button type="submit" disabled={isPending || !title.trim()} className="w-30">
              {isPending ? <Spinner /> : "Create document"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/spaces/${spaceId}`}>Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
