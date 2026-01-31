"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { RefreshCw, Home } from "lucide-react";
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
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-burgundy-100 flex items-center justify-center mx-auto mb-6">
          <span className="font-display text-3xl text-burgundy-500">!</span>
        </div>
        <h1 className="font-display text-2xl text-charcoal-900 mb-4">
          We Encountered an Unexpected Issue
        </h1>
        <p className="text-charcoal-600 mb-8">
          We regret this interruption. Please attempt again or return to begin anew.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={reset}
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Attempt Again
          </Button>
          <Link href="/">
            <Button variant="secondary" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}