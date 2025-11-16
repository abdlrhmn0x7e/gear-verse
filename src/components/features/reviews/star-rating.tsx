import { StarIcon } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="relative z-10 flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`size-4 ${
            star <= rating ? "fill-current text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
