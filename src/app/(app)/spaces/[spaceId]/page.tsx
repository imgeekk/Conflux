import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import Link from "next/link";

import {
  FileIcon,
  QuestionMarkIcon,
  ClockIcon,
  PlusIcon,
  FolderIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  getDocumentsBySpaceId,
  getMemberByUserIdAndWorkspaceId,
  getQuestionsBySpaceId,
  getSpaceById,
} from "@/lib/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const session = await requireSession();

  const space = await getSpaceById(spaceId);
  if (!space) notFound();

  const member = await getMemberByUserIdAndWorkspaceId(
    session.user.id,
    space.workspaceId,
  );
  if (!member) notFound();

  const docs = await getDocumentsBySpaceId(spaceId);
  const questions = await getQuestionsBySpaceId(spaceId);

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      {/* Space header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderIcon className="w-7 h-7 shrink-0 text-chart-2" />
            <h1 className="text-xl font-semibold text-foreground">
              {space.name}
            </h1>
          </div>
          {space.description && (
            <p className="text-sm text-muted-foreground ml-9">
              {space.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/spaces/${spaceId}/questions/new`}>
              <PlusIcon className="w-3.5 h-3.5" />
              Ask
            </Link>
          </Button>
          <Button variant="default" asChild>
            <Link href={`/spaces/${spaceId}/docs/new`}>
              <PlusIcon className="w-3.5 h-3.5" />
              New doc
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{docs.length}</CardTitle>
            <CardDescription>Documents</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{questions.length}</CardTitle>
            <CardDescription>Questions asked</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 grid-rows-1">
        {/* Documents */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-md font-medium text-muted-foreground ">
              Documents
            </h2>
            <Button
              variant="ghost"
              asChild
              size="xs"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href={`/spaces/${spaceId}/docs/new`}>New doc →</Link>
            </Button>
          </div>

          {docs.length === 0 ? (
            <Card className="text-center flex-1">
              <CardContent className="h-full flex flex-col items-center justify-center py-8">
                <Button variant="outline" asChild>
                  <FileIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                </Button>
                <p className="text-sm text-muted-foreground mb-0.5">
                  No documents yet.{" "}
                </p>
                <Button variant="secondary" asChild>
                  <Link href={`/spaces/${spaceId}/docs/new`}>
                    Write the first one
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
              {docs.map((doc) => (
                <Button
                  key={doc.id}
                  variant="outline"
                  asChild
                  className="w-full h-auto justify-start gap-3 p-3 rounded-xl"
                >
                  <Link href={`/spaces/${spaceId}/docs/${doc.id}`}>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.author.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-md font-medium text-muted-foreground ">
              Questions
            </h2>
            <Button
              variant="ghost"
              asChild
              size="xs"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href={`/spaces/${spaceId}/questions/new`}>
                Ask a question →
              </Link>
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="text-center flex-1">
              <CardContent className="h-full flex flex-col items-center justify-center py-8">
                <Button variant="outline" asChild>
                  <QuestionMarkIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                </Button>
                <p className="text-sm text-muted-foreground mb-0.5">
                  No questions yet.{" "}
                </p>

                <Button variant="secondary" asChild>
                  <Link href={`/spaces/${spaceId}/questions/new`}>
                    Ask the first one
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
              {questions.map((q) => (
                <Button
                  key={q.id}
                  variant="outline"
                  asChild
                  className="w-full h-auto justify-start gap-3 p-3 rounded-xl"
                >
                  <Link href={`/spaces/${spaceId}/questions/${q.id}`}>
                    <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0">
                      <QuestionMarkIcon className="w-4 h-4 text-chart-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {q.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {q.author.name} · {q.answers.length} answer
                        {q.answers.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
