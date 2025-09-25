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
import { Textarea } from "~/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { useEffect, useState } from "react";

const reviewFormSchema = z.object({
  rating: z
    .number("Rating is required")
    .min(1, "Rating is required")
    .max(5, "Rating must be less than 5"),
  comment: z.string("Comment is required").min(1, "Comment is required"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewForm({
  onSubmit,
  defaultValues,
  id,
}: {
  onSubmit: (data: ReviewFormValues) => void;
  defaultValues?: ReviewFormValues;
  id?: number;
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
          form.resetField("comment");
        }}
      >
        <div className="dark:bg-input/30 ring-ring/50 space-y-3 rounded-lg border px-2 pt-2 pb-4 transition-all duration-200 has-focus-visible:ring-2">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="h-24 resize-none border-transparent bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
                    placeholder="Write your review here..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RatingInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

  const getStarColor = (starIndex: number) => {
    const rating = hoveredRating ?? value;
    return rating >= starIndex ? "text-yellow-400" : "text-gray-300";
  };

  const handleMouseEnter = (starIndex: number) => {
    setHoveredRating(starIndex);
  };

  const handleMouseLeave = () => {
    setHoveredRating(null);
  };

  const handleClick = (starIndex: number) => {
    onChange(starIndex);
  };

  return (
    <div className="pointer-events-auto flex items-center">
      <div className="flex items-center gap-0" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className="relative px-1"
            onMouseEnter={() => handleMouseEnter(star)}
          >
            <input
              type="radio"
              value={star.toString()}
              checked={value === star}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="sr-only"
              id={`star-${star}`}
              name="rating"
            />
            <label
              htmlFor={`star-${star}`}
              className="flex cursor-pointer items-center justify-center rounded-sm p-1 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:outline-none"
              onClick={() => handleClick(star)}
            >
              <StarIcon
                className={`size-5 transition-all duration-100 ${getStarColor(star)} ${
                  hoveredRating !== null && hoveredRating >= star
                    ? "opacity-75"
                    : ""
                }`}
                fill={
                  hoveredRating !== null && hoveredRating >= star
                    ? "currentColor"
                    : value >= star
                      ? "currentColor"
                      : "none"
                }
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
