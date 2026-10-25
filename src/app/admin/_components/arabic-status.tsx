"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { Spinner } from "~/components/spinner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ArabicStatus } from "~/lib/arabic";
import { useTRPC } from "~/trpc/client";

const badges = {
  missing: { variant: "outline", label: "Missing" },
  draft: { variant: "warning", label: "Draft" },
  reviewed: { variant: "success", label: "Reviewed" },
} as const;

/** The Arabic copy's status; the text carries it, the color only backs it up. */
export function ArabicStatusBadge({
  status,
  className,
}: {
  status: ArabicStatus;
  className?: string;
}) {
  const badge = badges[status];
  return (
    <Badge variant={badge.variant} className={className}>
      {status === "reviewed" && <CheckIcon data-icon="inline-start" />}
      <span className="sr-only">Arabic </span>
      {badge.label}
    </Badge>
  );
}

const markerLabels = {
  missing: "Arabic missing",
  draft: "Arabic draft, not reviewed yet",
  reviewed: "Arabic reviewed",
} as const;

/** The status as a one-letter chip, for rows too narrow for the badge; the tooltip spells it out. */
export function ArabicStatusMarker({ status }: { status: ArabicStatus }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant={badges[status].variant}
            className="size-4 rounded-md p-0 leading-none"
          />
        }
      >
        <span aria-hidden lang="ar">
          ع
        </span>
        <span className="sr-only">{markerLabels[status]}</span>
      </TooltipTrigger>
      <TooltipContent>{markerLabels[status]}</TooltipContent>
    </Tooltip>
  );
}

/** Marks the saved Arabic as checked against the English, without saving anything else. */
export function MarkArabicReviewedButton({
  target,
  id,
  onReviewed,
}: {
  target: "products" | "categories";
  id: number;
  onReviewed: () => void;
}) {
  const trpc = useTRPC();
  const { mutate, isPending } = useMutation(
    target === "products"
      ? trpc.admin.products.mutations.markArabicReviewed.mutationOptions()
      : trpc.admin.categories.mutations.markArabicReviewed.mutationOptions(),
  );

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        mutate(
          { id },
          {
            onSuccess: onReviewed,
            onError: () => toast.error("Couldn't mark the Arabic as reviewed"),
          },
        )
      }
    >
      {isPending ? (
        <Spinner size="small" data-icon="inline-start" />
      ) : (
        <CheckIcon data-icon="inline-start" />
      )}
      Mark as reviewed
    </Button>
  );
}
