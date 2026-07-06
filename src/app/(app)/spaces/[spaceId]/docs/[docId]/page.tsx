import { notFound } from "next/navigation"
import Link from "next/link"
import { requireSession } from "@/lib/session"
import { getDocumentById, getMemberByUserIdAndWorkspaceId } from "@/lib/services"
import { ArrowLeftIcon, PencilSimpleIcon, ClockIcon, UserIcon, CubeIcon } from "@phosphor-icons/react/dist/ssr"
import { TipTapEditor } from "@/components/tiptap-editor"
import { Button } from "@/components/ui/button"

type Params = Promise<{ spaceId: string; docId: string }>

export default async function DocViewPage({ params }: { params: Params }) {
  const { spaceId, docId } = await params
  const session = await requireSession()

  const doc = await getDocumentById(docId)
  if (!doc) notFound()

  const member = await getMemberByUserIdAndWorkspaceId(session.user.id, doc.space.workspaceId)
  if (!member) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/spaces/${spaceId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to space
        </Link>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/spaces/${spaceId}/docs/${docId}/edit`}>
            <PencilSimpleIcon className="w-3.5 h-3.5" />
            Edit
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-3">{doc.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
        <span className="flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5" />
          {doc.author.name}
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5" />
          Updated {new Date(doc.updatedAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1.5">
          <CubeIcon className="w-3.5 h-3.5" />
          {doc.chunks.length} chunk{doc.chunks.length !== 1 ? "s" : ""}
        </span>
      </div>

      <TipTapEditor content={doc.content ?? undefined} readOnly />
    </div>
  )
}
