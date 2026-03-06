"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { Review } from "@/lib/api";
import { Star, Trash2, Loader2, Check, X, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (filter === "pending") params.approved = "false";
      if (filter === "approved") params.approved = "true";
      const data = await adminApi.getReviews(params);
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
  }, [page, filter]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveReview(id);
      toast.success("Review approved");
      fetchReviews();
    } catch {
      toast.error("Failed to approve review");
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await adminApi.replyReview(id, replyText.trim());
      toast.success("Reply posted");
      setReplyingTo(null);
      setReplyText("");
      fetchReviews();
    } catch {
      toast.error("Failed to post reply");
    }
  };

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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reviews</h1>
          <p className="text-gray-500 text-sm">Moderate customer reviews</p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Rating</th>
                <th className="px-6 py-4 text-left">Review</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading reviews...</span>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(review as any).product?.title || "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-sm">
                      {(review as any).user?.name || review.userName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="font-semibold text-sm">{review.rating}</span>
                        <Star size={14} fill="currentColor" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {review.title && (
                        <p className="font-medium text-gray-900 mb-0.5">{review.title}</p>
                      )}
                      <p className="truncate">{review.comment}</p>
                      {review.adminReply && (
                        <p className="text-xs text-green-600 mt-1">Reply: {review.adminReply}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        review.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === review.id ? null : review.id);
                            setReplyText(review.adminReply || "");
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Reply"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {replyingTo === review.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-green-600"
                          />
                          <button
                            onClick={() => handleReply(review.id)}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Send
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalCount > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {Math.ceil(totalCount / 10)}
            </span>
            <button
              disabled={page * 10 >= totalCount}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
