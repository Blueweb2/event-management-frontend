import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F8F6FB]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        {/* Top navigation */}
        <div className="flex items-center px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#6B5B95]"
          >
            <ArrowLeft size={17} />
            Back
          </Link>
        </div>

        {/* Login */}
        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-6">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="px-4 py-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} EventManagement. All
          rights reserved.
        </div>
      </div>
    </main>
  );
}