"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Review } from "@/lib/api";
import { Star, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getReviews({ page, limit: 10 });
      setReviews(data.reviews);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await adminApi.deleteReview(id);
      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A1A] mb-2">Reviews</h1>
          <p className="text-[#8C7B75] text-sm">Moderate customer reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
         {}
         <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAF6F0] text-[#5A4D48] text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Rating</th>
                <th className="px-6 py-4 text-left">Comment</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
             <tbody className="divide-y divide-[#E0E0E0]">
                 {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#8C7B75]">
                        <div className="flex justify-center items-center gap-2">
                           <Loader2 className="animate-spin" size={20} />
                           <span>Loading reviews...</span>
                        </div>
                      </td>
                    </tr>
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#8C7B75]">
                        No reviews found.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-[#FAFAFA] transition-colors">
                            <td className="px-6 py-4 font-medium text-[#1A1A1A]">
                                {review.userName}
                            </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-[#C9A227]">
                                    <span className="font-bold">{review.rating}</span>
                                    <Star size={14} fill="currentColor" />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#555] max-w-md truncate">
                                {review.comment}
                                {review.media && review.media.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        <div className="flex items-center gap-1 text-xs text-[#8C7B75] bg-[#F5F5F5] px-2 py-1 rounded">
                                            <ImageIcon size={12} />
                                            <span>{review.media.length} photos</span>
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#888]">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </td>
                             <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="p-2 text-[#AAA] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Review"
                                >
                                    <Trash2 size={18} />
                                </button>
                             </td>
                      </tr>
                    ))
                  )}
             </tbody>
          </table>
         </div>

         {}
         {totalCount > 10 && (
             <div className="px-6 py-4 border-t border-[#E0E0E0] flex items-center justify-end gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-sm border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    disabled={page * 10 >= totalCount}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-sm border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] disabled:opacity-50"
                >
                    Next
                </button>
            </div>
         )}
      </div>
    </div>
  );
}
