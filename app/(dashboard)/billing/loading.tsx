import { CardSkeleton } from "@/app/components/shared/ui/Skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-4">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
