"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  SparkleIcon,
  SmileySadIcon,
  PencilSimpleLineIcon,
  QuestionMarkIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useSession } from "@/lib/auth-client";
import {
  useQuestion,
  useAcceptAnswer,
  useEditAnswer,
  useCreateAnswer,
} from "@/hooks/use-answers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import Loader from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { ExpertSuggestionCard } from "@/components/ExpertSuggestionCard";
export default function QuestionDetailPage() {
  const params = useParams<{ spaceId: string; questionId: string }>();
  const { spaceId, questionId } = params;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { data: question, isLoading, isError } = useQuestion(questionId);
  const { mutate: acceptAnswer, isPending: isAccepting } =
    useAcceptAnswer(spaceId);
  const { mutate: editAnswer } = useEditAnswer(spaceId);
  const { mutate: createAnswer, isPending: isCreatingAnswer } = useCreateAnswer(
    questionId,
    spaceId,
  );
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [newAnswerBody, setNewAnswerBody] = useState("");
  const isQuestionAuthor = currentUserId === question?.authorId;
  function handleAccept(answerId: string) {
    acceptAnswer(answerId);
  }
  function handleStartEdit(answer: any) {
    setEditingAnswerId(answer.id);
    setEditBody(answer.body);
  }
  function handleCancelEdit() {
    setEditingAnswerId(null);
    setEditBody("");
  }
  function handleSaveEdit(answerId: string) {
    if (!editBody.trim()) return;
    editAnswer({ answerId, body: editBody.trim() });
    setEditingAnswerId(null);
    setEditBody("");
  }
  function handleSubmitAnswer() {
    if (!newAnswerBody.trim() || isCreatingAnswer) return;
    createAnswer(
      { body: newAnswerBody.trim() },
      { onSuccess: () => setNewAnswerBody("") },
    );
  }
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        <div className="h-full flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }
  if (isError || !question) {
    return (
      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <SmileySadIcon className="w-6 h-6" />
          <p className="text-sm">Question not found</p>
          <Button variant="link" asChild size="sm">
            <Link href={`/spaces/${spaceId}/questions`}>Back to questions</Link>
          </Button>
        </div>
      </div>
    );
  }
  const acceptedAnswer = question.answers.find((a) => a.isAccepted);
  const otherAnswers = question.answers
    .filter((a) => !a.isAccepted)
    .sort((a, b) => {
      if (a.isAiDraft && !b.isAiDraft) return -1;
      if (!a.isAiDraft && b.isAiDraft) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="shrink-0 pt-1 pb-3">
        <Button variant="ghost" asChild size="sm">
          <Link href={`/spaces/${spaceId}/questions`}>
            <ArrowLeftIcon className="w-4 h-4" />
            Back to questions
          </Link>
        </Button>
      </div>
      {/* Scrollable feed */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 px-1 py-1 feed-scrollbar-thin">
        {/* Question card */}
        <Card>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0 mt-0.5">
                <QuestionMarkIcon className="w-5 h-5 shrink-0 text-chart-2 mt-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{question.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(question as any).author?.name} ·{" "}
                  {new Date(question.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Accepted answer */}
        {acceptedAnswer && (
          <Card className="border-chart-1/60 dark:border-chart-5/60 border">
            <CardContent>
              <div className="flex items-start gap-3">
                <CheckCircleIcon
                  className="w-5 h-5 shrink-0 text-chart-2 mt-0.5"
                  weight="fill"
                />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-chart-2 uppercase tracking-wider">
                      Accepted Answer
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary">
                    {acceptedAnswer.body}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {(acceptedAnswer as any).author?.name ?? "AI Draft"} ·{" "}
                    {new Date(acceptedAnswer.createdAt).toLocaleDateString()}
                  </div>
                  {acceptedAnswer.isAiDraft && acceptedAnswer.lowConfidence && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
                      <WarningIcon className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>The AI wasn't fully confident about this answer.</span>
                    </div>
                  )}
                  {acceptedAnswer.isAiDraft && acceptedAnswer.lowConfidence && acceptedAnswer.expert && (
                    <ExpertSuggestionCard expert={acceptedAnswer.expert} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* All answers section */}
        {otherAnswers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              {otherAnswers.length} answer{otherAnswers.length !== 1 ? "s" : ""}
            </h3>
            {otherAnswers.map((answer) => (
              <Card key={answer.id}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* AI badge */}
                      {answer.isAiDraft && (
                        <div className="flex items-center gap-1.5">
                          <SparkleIcon className="w-3.5 h-3.5 text-chart-2" />
                          <span className="text-xs text-muted-foreground">
                            AI-generated draft
                          </span>
                        </div>
                      )}
                      {/* Low confidence warning */}
                      {answer.isAiDraft && answer.lowConfidence && (
                        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
                          <WarningIcon className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>The AI isn't fully confident about this answer.</span>
                        </div>
                      )}
                      {/* Expert suggestion */}
                      {answer.isAiDraft && answer.lowConfidence && answer.expert && (
                        <ExpertSuggestionCard expert={answer.expert} />
                      )}
                      {/* Body: edit mode vs read mode */}
                      {editingAnswerId === answer.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            className="resize-none"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(answer.id)}
                              disabled={!editBody.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary">
                            {answer.body}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {(answer as any).author?.name ?? "AI Draft"} ·{" "}
                              {new Date(answer.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              {/* Accept button — only for question author, hide if already accepted */}
                              {isQuestionAuthor && !answer.isAccepted && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => handleAccept(answer.id)}
                                  disabled={isAccepting}
                                >
                                  <CheckCircleIcon className="w-3.5 h-3.5" />
                                  Accept
                                </Button>
                              )}
                              {/* Edit button — only for question author, only on AI drafts */}
                              {isQuestionAuthor && answer.isAiDraft && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => handleStartEdit(answer)}
                                >
                                  <PencilSimpleLineIcon className="w-3.5 h-3.5" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Empty state — no accepted answer and no other answers */}
        {!acceptedAnswer && otherAnswers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-12">
            <SmileySadIcon className="w-6 h-6" />
            <p className="text-sm text-center">
              No answers yet. Be the first to answer!
            </p>
          </div>
        )}
      </div>
      {/* Human answer form */}
      <div className="shrink-0 bg-background pt-3 pb-6 relative">
        <div className="absolute bottom-full left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitAnswer();
          }}
        >
          <div className="relative">
            <Textarea
              value={newAnswerBody}
              onChange={(e) => setNewAnswerBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
              placeholder="Write your answer..."
              rows={3}
              maxLength={2000}
              disabled={isCreatingAnswer}
              className="resize-none pr-12"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-1.5 right-1.5"
              disabled={isCreatingAnswer || !newAnswerBody.trim()}
            >
              {isCreatingAnswer ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <ArrowUpIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
