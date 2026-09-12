"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "staff";
    };
    token: string;
  };
}

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email.trim(),
          password,
        }),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Login failed"
        );
      }

      if (!result.data) {
        throw new Error("Invalid login response");
      }

      const { user, token } = result.data;

      // Store token based on "Remember me"
      const storage = rememberMe ? localStorage : sessionStorage;
      const otherStorage = rememberMe ? sessionStorage : localStorage;

      otherStorage.removeItem("token");
      otherStorage.removeItem("user");

      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      // Redirect based on role (manager/admin -> /manager, staff -> /staff)
      const role = (user.role || "").toLowerCase();
      if (role === "admin" || role === "manager") {
        router.push("/manager");
      } else {
        router.push("/staff");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6B5B95] text-white shadow-sm">
            <CalendarDays size={23} />
          </div>

          <span className="text-xl font-bold text-gray-900">
            EventManagement
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1EDF7] text-[#6B5B95]">
            <LockKeyhole size={22} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to manage your events, duties, and
            bookings.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            leftIcon={<Mail size={18} />}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            leftIcon={<LockKeyhole size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="pointer-events-auto rounded-md p-1 text-gray-400 transition hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            }
            required
            autoComplete="current-password"
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 accent-[#6B5B95]"
              />

              <span className="text-sm text-gray-600">
                Remember me
              </span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#6B5B95] transition hover:text-[#57497D]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#6B5B95] hover:bg-[#57497D]"
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In
                <ArrowRight size={17} />
              </>
            )}
          </Button>
        </form>

        {/* Staff / Manager information */}
        <div className="mt-6 rounded-xl border border-[#E5DFEF] bg-[#F8F6FB] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#6B5B95]"
            />

            <div className="w-full">
              <p className="text-sm font-semibold text-gray-800">
                Manager & Staff Access
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Click below to auto-fill credentials for testing:
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@eventmanagement.com");
                    setPassword("admin123");
                  }}
                  className="rounded-lg bg-[#6B5B95]/10 px-2.5 py-1 text-xs font-medium text-[#6B5B95] transition hover:bg-[#6B5B95]/20"
                >
                  Manager: admin@eventmanagement.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("staff@eventmanagement.com");
                    setPassword("staff123");
                  }}
                  className="rounded-lg bg-[#6B5B95]/10 px-2.5 py-1 text-xs font-medium text-[#6B5B95] transition hover:bg-[#6B5B95]/20"
                >
                  Staff: staff@eventmanagement.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to website */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-gray-500 transition hover:text-[#6B5B95]"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}