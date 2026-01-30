"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-display text-8xl text-charcoal-200 mb-4">404</p>

        <h1 className="font-display text-2xl text-charcoal-900 mb-4">
          This Page is No Longer Available
        </h1>

        <p className="text-charcoal-600 mb-8">
          This page is no longer available, but we can help you find what you&apos;re seeking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>

          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Previous Page
          </Button>
        </div>
      </div>
    </div>
  );
}