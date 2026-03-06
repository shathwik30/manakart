import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center px-4">
      <div className="max-w-[600px] w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            Looking for something?
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            We&apos;re sorry, the page you requested could not be found.
            Please check the URL or go back to our homepage.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            If you entered a web address, please check it was entered correctly.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 text-sm bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors"
          >
            Go to ManaKart&apos;s Home Page
          </Link>
          <div className="border-t border-gray-200 mt-6 pt-4">
            <p className="text-xs text-gray-500">
              Need help?{" "}
              <Link href="/help" className="text-green-600 hover:text-green-700 hover:underline">
                Visit our Help Center
              </Link>
              {" "}or{" "}
              <Link href="/contact" className="text-green-600 hover:text-green-700 hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
