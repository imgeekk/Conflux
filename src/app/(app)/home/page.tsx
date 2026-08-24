import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FileIcon,
  QuestionMarkIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getTopExpertsInWorkspace } from "@/lib/services";
import { ExpertPanel } from "@/components/ExpertPanel";

export default async function HomePage() {
  const session = await requireSession();
  if (!session) {
    redirect("/login");
  }

  const membership = await prisma.member.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  const recentDocs = await prisma.document.findMany({
    where: { space: { workspaceId: membership?.workspaceId } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { author: true, space: true },
  });

  const recentQuestions = await prisma.question.findMany({
    where: { space: { workspaceId: membership?.workspaceId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: true, space: true, answers: true },
  });

  const experts = await getTopExpertsInWorkspace(
    membership?.workspaceId || "",
    5,
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-primary">
          Good to see you, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening in {membership?.workspace.name}
        </p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{recentDocs.length}</CardTitle>
                <CardDescription>Documents</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{recentQuestions.length}</CardTitle>
                <CardDescription>Questions asked</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 grid-rows-1">
            {/* Recent docs */}
            <div className="flex flex-col min-h-0">
              <h2 className="text-md font-medium text-muted-foreground mb-3 shrink-0">
                Recent documents
              </h2>
              {recentDocs.length === 0 ? (
                <Card className="text-center flex-1">
                  <CardContent className="h-full flex flex-col items-center justify-center py-4">
                    <Button variant="outline" asChild className="pointer-events-none">
                      <FileIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                    </Button>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      No documents yet. To get started
                    </p>
                    <Button variant="secondary" asChild>
                      <Link href="/spaces/new">Create a space</Link>
                    </Button>{" "}
                  </CardContent>
                </Card>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                  {recentDocs.map((doc) => (
                    <Button
                      key={doc.id}
                      variant="outline"
                      asChild
                      className="w-full h-auto justify-start gap-3 p-3"
                    >
                      <Link href={`/spaces/${doc.spaceId}/docs/${doc.id}`}>
                        <div className="w-8 h-8 bg-chart-2/10 flex items-center justify-center shrink-0">
                          <FileIcon className="w-4 h-4 text-chart-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doc.space.name} · {doc.author.name}
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

            {/* Recent questions */}
            <div className="flex flex-col min-h-0">
              <h2 className="text-md font-medium text-muted-foreground mb-3 shrink-0">
                Recent questions
              </h2>
              {recentQuestions.length === 0 ? (
                <Card className="text-center flex-1">
                  <CardContent className="h-full flex flex-col items-center justify-center py-4">
                    <Button variant="outline" asChild  className="pointer-events-none">
                      <QuestionMarkIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                    </Button>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      No questions yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                  {recentQuestions.map((q) => (
                    <Button
                      key={q.id}
                      variant="outline"
                      asChild
                      className="w-full h-auto justify-start gap-3 p-3"
                    >
                      <Link href={`/spaces/${q.spaceId}/questions/${q.id}`}>
                        <div className="w-8 h-8 bg-chart-2/10 flex items-center justify-center shrink-0">
                          <QuestionMarkIcon className="w-4 h-4 text-chart-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {q.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {q.space.name} · {q.answers.length} answer
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

        <aside className="w-64 shrink-0">
          <ExpertPanel title="Top Experts" experts={experts} />
        </aside>
      </div>
    </div>
  );
}
