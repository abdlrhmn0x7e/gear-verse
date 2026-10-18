"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";
import { toast } from "~/components/ui/toast";
import { DeleteDialog } from "~/components/delete-dialog";
import { StarRating } from "~/components/features/reviews/star-rating";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/client";
import { Panel, PanelEmpty, PanelSkeleton } from "./panel";
import { periodLabels, useDashboardRange } from "./use-dashboard-range";

/** The latest reviews of the period, to read and, if they break the rules, delete. */
export function NewReviews() {
  const trpc = useTRPC();
  const { range } = useDashboardRange();
  const { data } = useSuspenseQuery(
    trpc.admin.dashboard.queries.reviews.queryOptions({ range }),
  );

  return (
    <Panel title="New reviews">
      {data.length === 0 ? (
        <PanelEmpty icon={<MessageSquareIcon />}>
          No reviews {periodLabels[range]}.
        </PanelEmpty>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {data.map((review) => (
            <li key={review.id} className="flex items-start gap-2 py-2.5">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-muted-foreground truncate text-xs">
                    {review.authorName ?? "A customer"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm">{review.comment}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {review.productTitle}
                </p>
              </div>
              <DeleteReviewButton id={review.id} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DeleteReviewButton({ id }: { id: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation(
    trpc.admin.reviews.mutations.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Review deleted");
        void queryClient.invalidateQueries(
          trpc.admin.dashboard.queries.reviews.pathFilter(),
        );
      },
      onError: () => {
        toast.error("Couldn't delete the review. Try again.");
      },
    }),
  );

  return (
    <DeleteDialog
      entity="review"
      disabled={isPending}
      handleDelete={() => mutate({ id })}
      Trigger={
        <Button
          size="icon-sm"
          variant="destructive-ghost"
          className="-mr-1.5 shrink-0"
          aria-label="Delete review"
        >
          <Trash2Icon />
        </Button>
      }
    />
  );
}

export function NewReviewsSkeleton() {
  return <PanelSkeleton title="New reviews" rows={2} />;
}
