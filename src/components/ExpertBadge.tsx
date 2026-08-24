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
              {e.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.user.image}
                  alt={e.user.name}
                  className="size-6 rounded-full shrink-0"
                />
              ) : (
                <div className="size-6 rounded-full bg-chart-2/10 flex items-center justify-center text-xs font-medium shrink-0">
                  {e.user.name.charAt(0).toUpperCase()}
                </div>
              )}
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