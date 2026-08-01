"use client";
import { useExpertScoresByTag } from "@/hooks/use-expert-scores";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { UserIcon } from "@phosphor-icons/react";
export function ExpertBadge({ tagId }: { tagId: string }) {
  const { data: experts = [] } = useExpertScoresByTag(tagId);
  if (experts.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserIcon className="w-3 h-3" />
          {experts.length} {experts.length === 1 ? "expert" : "experts"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex flex-col gap-1">
          {experts.map((e) => (
            <div
              key={e.user.id}
              className="flex items-center gap-2 px-2 py-1.5 text-xs"
            >
              <span className="font-medium text-foreground">
                {e.user.name}
              </span>
              <span className="ml-auto text-muted-foreground">
                {e.score} pts
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}