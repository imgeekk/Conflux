"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  QuestionMarkIcon,
  SparkleIcon,
  SmileySadIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuestions, useCreateQuestion } from "@/hooks/use-questions";
import { useRetryAnswer } from "@/hooks/use-retry-answer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import Loader from "@/components/Loader";
import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "border-beam";
export default function QuestionsPage() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  const [text, setText] = useState("");
  const { data: questions = [], isLoading } = useQuestions(spaceId);
  const { mutate: createQuestion, isPending } = useCreateQuestion();
  const { mutateAsync: retryAnswer } = useRetryAnswer();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  function submit() {
    if (!text.trim() || isPending) return;
    createQuestion(
      { text: text.trim(), spaceId },
      { onSuccess: () => setText("") },
    );
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  async function handleRetry(questionId: string) {
    setRetryingId(questionId);
    try {
      await retryAnswer(questionId);
    } catch {
    } finally {
      setRetryingId(null);
    }
  }
  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)] w-full max-w-4xl mx-auto">
      <div id="header" className="shrink-0 pt-1 pb-3">
        <Button variant="ghost" asChild size="sm">
          <Link href={`/spaces/${spaceId}`}>
            <ArrowLeftIcon className="w-4 h-4" />
            Back to space
          </Link>
        </Button>
      </div>
      <div
        id="questions-feed"
        className="flex-1 min-h-0 overflow-y-auto space-y-3 px-1 py-1 feed-scrollbar-thin"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : questions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <SmileySadIcon className="w-6 h-6" />
            <p className="text-sm text-muted-foreground text-center">
              No questions yet.
            </p>
          </div>
        ) : (
          [...questions].reverse().map((q) => {
            const isPending = (q.id as string).startsWith("pending-");
            const answers = (q as any).answers ?? [];
            const hasAccepted = answers.some((a: any) => a.isAccepted);
            const cardContent = (
              <>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-chart-2/10 mt-0.5 flex items-center justify-center shrink-0">
                      <QuestionMarkIcon className="w-4 h-4 text-chart-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{q.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(q as any).author?.name} ·{" "}
                        {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
                {answers.length > 0 ? (
                  <CardContent>
                    <div className="pl-8 space-y-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary">
                        {answers[0].body}
                      </p>
                      {answers[0].isAiDraft && (
                        <div className="flex items-center gap-1.5">
                          <SparkleIcon className="w-3.5 h-3.5 text-chart-2" />
                          <span className="text-xs text-muted-foreground">
                            AI-generated draft
                          </span>
                        </div>
                      )}
                      {answers[0].isAiDraft && answers[0].lowConfidence && (
                        <div className="flex items-center gap-1.5">
                          <WarningIcon className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Low confidence
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        {hasAccepted && (
                          <span className="flex items-center gap-1 text-chart-2">
                            <CheckCircleIcon className="w-3 h-3" weight="fill" />
                            Accepted
                          </span>
                        )}
                        <span>
                          {answers.length} answer
                          {answers.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                ) : isPending ? (
                  <CardContent>
                    <div className="pl-8">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader size="xs" />
                        Generating answer…
                      </div>
                    </div>
                  </CardContent>
                ) : retryingId === q.id ? (
                  <CardContent>
                    <div className="pl-8">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader size="xs" />
                        Generating answer…
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent>
                    <div className="pl-8">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <SmileySadIcon className="w-3.5 h-3.5" />
                        AI couldn't generate an answer
                        <Button
                          variant="ghost"
                          size="sm"
                          className="z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRetry(q.id);
                          }}
                        >
                          Try again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </>
            );
            return isPending ? (
              <Card key={q.id}>{cardContent}</Card>
            ) : (
              <Link key={q.id} href={`/spaces/${spaceId}/questions/${q.id}`} className="block">
                <Card>{cardContent}</Card>
              </Link>
            );
          })
        )}
      </div>
      <div id="input" className="shrink-0 bg-background pt-3 pb-6 relative">
        <div className="absolute bottom-full left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none" />
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <BorderBeam size="md" theme="auto" colorVariant="ocean" borderRadius={0}>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Ask a question..."
                rows={3}
                maxLength={500}
                disabled={isPending || isLoading}
                className="resize-none pr-12"
              />
            </BorderBeam>
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-1.5 right-1.5"
              disabled={isPending || isLoading || !text.trim()}
            >
              {isPending ? (
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
