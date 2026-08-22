"use client";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "border-beam";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace-context";
import {
  SmileySadIcon,
  FileIcon,
  QuestionMarkIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import Loader from "./Loader";
import { ApiExpertSummary, SearchSource } from "@/lib/types";
interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const { workspace } = useWorkspace();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [expert, setExpert] = useState<ApiExpertSummary | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  function reset() {
    setQuery("");
    setAnswer("");
    setSources([]);
    setLoading(false);
    setSearched(false);
    setExpert(null);
    setLowConfidence(false);
  }
  async function handleSubmit() {
    if (!query.trim() || !workspace?.id) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          workspaceId: workspace.id,
        }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources ?? []);
      setExpert(data.expert);
      setLowConfidence(data.lowConfidence);
    } catch {
      setAnswer("Something went wrong. Please try again.");
      setSources([]);
      setExpert(null);
      setLowConfidence(false);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Sheet
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) reset();
        onOpenChange(newOpen);
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
          <SheetDescription>
            Ask a question and get answers from your knowledge base.
          </SheetDescription>
        </SheetHeader>
        <div className="flex gap-2 px-4 pb-3">
          <BorderBeam size="sm" theme="auto" colorVariant="ocean" className="flex-1" borderRadius={0}>
            <Input
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />
          </BorderBeam>
          <Button onClick={handleSubmit} disabled={loading || !query.trim()}>
            Send
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {loading && (
            <div className="flex-col items-center justify-center mt-8">
              <div className="flex items-center justify-center">
                <Loader size="sm" />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Searching your knowledge base for answers...
              </p>
            </div>
          )}
          {searched && !loading && answer && (
            <>
              {lowConfidence && expert && (
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2">
                  <WarningIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>The AI isn't fully confident about this answer.</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {answer}
              </p>
              {expert && (
                <div className="flex items-center gap-2.5 border border-border rounded p-3">
                  {expert.image ? (
                    <img src={expert.image} alt={expert.name} className="size-8 rounded-full shrink-0" />
                  ) : (
                    <div className="size-8 rounded-full bg-chart-2/10 flex items-center justify-center text-xs font-medium shrink-0">
                      {expert.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Consider asking {expert.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {expert.topTag
                        ? `Top expert on ${expert.topTag.name} · ${expert.totalScore} pts`
                        : `${expert.totalScore} pts`}
                    </p>
                  </div>
                </div>
              )}

              {sources.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Sources
                  </p>
                  <div className="space-y-1">
                    {sources.map((s) => (
                      <div
                        key={`${s.sourceType}-${s.sourceId}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        {s.sourceType === "document" ? (
                          <Link
                            href={`/spaces/${s.spaceId}/docs/${s.sourceId}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <FileIcon className="w-3.5 h-3.5" />
                            </Button>
                            <span className="truncate">{s.sourceTitle}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Button
                              variant="outline"
                              size="icon"
                            >
                              <QuestionMarkIcon className="w-3.5 h-3.5 shrink-0" />
                            </Button>
                            <span className="truncate">{s.sourceTitle}</span>
                          </div>
                        )}
                        {s.author && (
                          <span className="text-xs text-muted-foreground truncate">
                            {s.sourceType === "answer" ? "Answered by" : "Written by"} {s.author.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {searched && !loading && !answer && (
            <div>
              <SmileySadIcon className="w-6 h-6 text-muted-foreground mx-auto mt-8" />
              <p className="text-xs text-center text-muted-foreground mt-2">
                I couldn't find any relevant information in your knowledge base
                to answer this question.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
