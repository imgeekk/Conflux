
interface ExpertSuggestionCardProps {
    expert: { id: string; name: string; image: string | null };
}

export function ExpertSuggestionCard({ expert }: ExpertSuggestionCardProps) {
    return (
        <div className="flex items-center gap-2.5 pb-3">
            {expert.image ? (
                <img
                    src={expert.image}
                    alt={expert.name}
                    className="size-8 rounded-full shrink-0"
                />
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
                    They may be able to help with this topic
                </p>
            </div>
        </div>
    );
}
