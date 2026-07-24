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
} from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import Loader from "./Loader";
interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const { workspace } = useWorkspace();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<
    {
      sourceId: string;
      sourceTitle: string;
      sourceType: "document" | "answer";
      spaceId: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  function reset() {
    setQuery("");
    setAnswer("");
    setSources([]);
    setLoading(false);
    setSearched(false);
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
    } catch {
      setAnswer("Something went wrong. Please try again.");
      setSources([]);
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {answer}
              </p>
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
