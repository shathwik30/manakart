"use client";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-charcoal-600 mb-6">
          {error.message || "An unexpected error occurred in the admin dashboard"}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/admin"
            className="px-6 py-2 border border-charcoal-300 text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
