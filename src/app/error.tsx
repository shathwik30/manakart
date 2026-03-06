"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center px-4">
      <div className="max-w-[600px] w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl font-semibold text-red-600">!</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2 text-sm bg-gray-900 rounded-lg text-white hover:bg-gray-800 cursor-pointer transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Go to ManaKart Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
