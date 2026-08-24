import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApiExpertSummary } from "@/lib/types";
export function ExpertPanel({
  title,
  experts,
}: {
  title: string;
  experts: ApiExpertSummary[];
}) {
  if (experts.length === 0) return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center text-xs text-muted-foreground">
        No experts yet
      </CardContent>
    </Card>
  );
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {experts.map((e) => (
          <div key={e.id} className="flex items-center gap-2.5">
            {e.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.image}
                alt={e.name}
                className="size-7 rounded-full shrink-0"
              />
            ) : (
              <div className="size-7 rounded-full bg-chart-2/10 flex items-center justify-center text-xs font-medium shrink-0">
                {e.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {e.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {e.topTag
                  ? `${e.topTag.name} · ${e.totalScore} pts`
                  : `${e.totalScore} pts`}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}