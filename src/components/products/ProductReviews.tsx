"use client";

import { useState, useEffect } from "react";
import { Loader2, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { reviewsApi, Review, ReviewStats } from "@/lib/api";
import { Rating } from "@/components/ui";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await reviewsApi.getForProduct(productId);
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px]">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Customer reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Left: Summary */}
        <div>
          {stats && stats.totalReviews > 0 ? (
            <>
              {/* Overall Rating */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Rating value={stats.averageRating} size="md" />
                  <span className="text-sm text-gray-900 font-medium">
                    {stats.averageRating.toFixed(1)} out of 5
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.totalReviews.toLocaleString()} global rating{stats.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating Distribution Bars */}
              <div className="space-y-2.5 mb-6">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    stats.ratingDistribution?.[String(rating)] || 0;
                  const percentage =
                    stats.totalReviews > 0
                      ? Math.round((count / stats.totalReviews) * 100)
                      : 0;
                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <span className="text-sm text-green-600 hover:text-green-700 hover:underline whitespace-nowrap w-[52px]">
                        {rating} star
                      </span>
                      <div className="flex-1 h-[18px] bg-gray-100 rounded overflow-hidden border border-gray-200">
                        <div
                          className="h-full bg-amber-500 rounded transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap w-[35px] text-right">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-200 mb-4" />
            </>
          ) : (
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                No reviews yet for this product.
              </p>
            </div>
          )}

          {/* Write a review button */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Review this product
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Share your thoughts with other customers
            </p>
            <button className="w-full py-2 px-4 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
              Write a customer review
            </button>
          </div>
        </div>

        {/* Right: Individual Reviews */}
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-0">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-5 mb-5 last:border-0"
                >
                  {/* Reviewer info */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {review.userName}
                    </span>
                  </div>

                  {/* Rating + Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <Rating value={review.rating} size="sm" />
                    {review.title && (
                      <span className="text-sm font-semibold text-gray-900">
                        {review.title}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 mb-2">
                    Reviewed on {formatDate(review.createdAt)}
                  </p>

                  {/* Verified badge */}
                  <span className="inline-block text-xs text-green-600 font-semibold mb-2">
                    Verified Purchase
                  </span>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-gray-700 leading-6">
                      {review.comment}
                    </p>
                  )}

                  {/* Admin reply */}
                  {review.adminReply && (
                    <div className="mt-3 ml-4 pl-3 border-l-2 border-green-500">
                      <p className="text-xs font-semibold text-green-600 mb-1">
                        Seller response
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                Be the first to review this product.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
