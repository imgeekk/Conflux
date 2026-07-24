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
    <div className="flex flex-col h-[calc(100dvh-6rem)] max-w-3xl mx-auto">
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
          [...questions].reverse().map((q) => (
            <Card key={q.id}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <QuestionMarkIcon className="w-5 h-5 shrink-0 text-chart-2 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(q as any).author?.name} ·{" "}
                      {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              {(q as any).answers?.length > 0 ? (
                <CardContent>
                  <div className="pl-8 space-y-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary">
                      {(q as any).answers[0].body}
                    </p>
                    {(q as any).answers[0].isAiDraft && (
                      <div className="flex items-center gap-1.5">
                        <SparkleIcon className="w-3.5 h-3.5 text-chart-2" />
                        <span className="text-xs text-muted-foreground">
                          AI-generated draft
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              ) : (q.id as string).startsWith("pending-") ? (
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
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => handleRetry(q.id)}
                      >
                        Try again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
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
                disabled={isPending}
                className="resize-none pr-12"
              />
            </BorderBeam>
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-1.5 right-1.5"
              disabled={isPending || !text.trim()}
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
