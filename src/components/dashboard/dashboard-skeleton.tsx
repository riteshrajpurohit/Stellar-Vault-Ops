import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-12">
      <Card className="xl:col-span-12">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/5 rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </CardContent>
      </Card>

      <Card className="xl:col-span-7">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-56 w-full rounded-3xl" />
        </CardContent>
      </Card>

      <Card className="xl:col-span-5">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </CardContent>
      </Card>
    </div>
  );
}
