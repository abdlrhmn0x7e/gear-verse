"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import TextareaAutosize from "react-textarea-autosize";
import { cn } from "~/lib/utils";

const reviewFormSchema = z.object({
  rating: z
    .number("Rating is required")
    .min(1, "Rating is required")
    .max(5, "Rating must be less than 5"),
  comment: z.string("Comment is required").min(1, "Comment is required"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewForm({
  id,
  onSubmit,
  defaultValues,
}: {
  id?: number;
  onSubmit: (data: ReviewFormValues) => void;
  defaultValues?: ReviewFormValues;
}) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: defaultValues ?? {
      rating: 5,
      comment: "",
    },
  });

  useEffect(() => {
    const onEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void form.handleSubmit(onSubmit)();
        form.resetField("comment");
      }
    };

    window.addEventListener("keydown", onEnter);

    return () => {
      window.removeEventListener("keydown", onEnter);
    };
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <form
        id={id ? `review-form-${id}` : "review-form"}
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)();
          if (!defaultValues) {
            form.resetField("comment");
          }
        }}
      >
        <div className="surface-control surface-field flex flex-col rounded-[24px]">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <TextareaAutosize
                    aria-label="Your review"
                    className="placeholder:text-muted-foreground flex min-h-20 w-full resize-none bg-transparent px-5 pt-4 pb-2 text-base outline-none md:text-sm"
                    placeholder="What did you think of it?"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="px-3.5 pb-3.5">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const shown = hoveredRating ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex items-center"
      onMouseLeave={() => setHoveredRating(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          className="relative"
          onMouseEnter={() => setHoveredRating(star)}
        >
          <input
            type="radio"
            value={star.toString()}
            checked={value === star}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="peer sr-only"
            id={`star-${star}`}
            name="rating"
            aria-label={`${star} out of 5 stars`}
          />
          <label
            htmlFor={`star-${star}`}
            className="peer-focus-visible:outline-focus flex cursor-pointer items-center justify-center rounded-full p-1.5 peer-focus-visible:outline-2"
          >
            <StarIcon
              aria-hidden
              strokeWidth={1.5}
              className={cn(
                "size-5 transition-colors duration-100 select-none",
                shown >= star
                  ? "fill-foreground text-foreground"
                  : "text-muted-foreground",
              )}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
