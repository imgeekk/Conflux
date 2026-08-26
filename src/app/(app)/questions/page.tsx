import Link from "next/link";
import {
  QuestionMarkIcon,
  SmileySadIcon,
  FolderIcon,
} from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getQuestionsByWorkspaceId } from "@/lib/services";

export default async function AllQuestionsPage() {
  const session = await requireSession();
  if (!session) redirect("/login");

  const membership = await prisma.member.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) redirect("/new-workspace");

  const questions = await getQuestionsByWorkspaceId(membership.workspaceId);

  if (!questions) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <SmileySadIcon className="w-6 h-6" />
        <p className="text-sm text-muted-foreground text-center">
          No questions yet across any space.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full max-w-4xl mx-auto">
      <div className="shrink-0 pt-1 pb-3">
        <h1 className="text-xl font-semibold text-primary">All Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Questions across every space in {membership.workspace.name}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 px-1 py-1 feed-scrollbar-thin">
        {questions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <SmileySadIcon className="w-6 h-6" />
            <p className="text-sm text-muted-foreground text-center">
              No questions yet across any space.
            </p>
          </div>
        ) : (
          questions.map((q) => {
            const answers = q.answers ?? [];
            return (
              <Link
                key={q.id}
                href={`/spaces/${q.spaceId}/questions/${q.id}`}
                className="block"
              >
                <Card>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-chart-2/10 mt-0.5 flex items-center justify-center shrink-0">
                        <QuestionMarkIcon className="w-4 h-4 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{q.text}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FolderIcon className="w-3 h-3 text-chart-2" />
                            {q.space.name}
                          </span>
                          <span>·</span>
                          <span>{q.author.name}</span>
                          <span>·</span>
                          <span>
                            {answers.length} answer
                            {answers.length !== 1 ? "s" : ""}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(q.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
