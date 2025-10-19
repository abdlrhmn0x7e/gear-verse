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
import { InputGroup, InputGroupAddon } from "~/components/ui/input-group";
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
  disabled,
  defaultValues,
}: {
  id?: number;
  onSubmit: (data: ReviewFormValues) => void;
  disabled?: boolean;
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
        <InputGroup>
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl data-slot="input-group-control">
                  <TextareaAutosize
                    className="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                    placeholder="Write your review here..."
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <InputGroupAddon align="block-end">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </InputGroupAddon>
        </InputGroup>
      </form>
    </Form>
  );
}

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const getStarColor = (starIndex: number) => {
    if (disabled) return "text-gray-300";

    const rating = hoveredRating ?? value;
    return rating >= starIndex ? "text-yellow-400" : "text-gray-300";
  };

  const handleMouseEnter = (starIndex: number) => {
    setHoveredRating(starIndex);
  };

  const handleMouseLeave = () => {
    if (disabled) return;

    setHoveredRating(null);
  };

  const handleClick = (starIndex: number) => {
    if (disabled) return;

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
              disabled={disabled}
            />
            <label
              htmlFor={`star-${star}`}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-sm p-1 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:outline-none",
                disabled && "cursor-not-allowed opacity-50",
              )}
              onClick={() => handleClick(star)}
            >
              <StarIcon
                className={cn(
                  "size-5 transition-all duration-100 select-none",
                  getStarColor(star),
                  hoveredRating !== null && hoveredRating >= star
                    ? !disabled && "opacity-75"
                    : "",
                )}
                fill={
                  disabled
                    ? "none"
                    : hoveredRating !== null && hoveredRating >= star
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
