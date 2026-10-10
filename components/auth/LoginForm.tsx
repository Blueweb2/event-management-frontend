"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { writeAuth } from "@/lib/auth-storage";
import { resetLogoutState } from "@/lib/api";
import type { AuthResult } from "@/types/auth";
import Image from "next/image";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: AuthResult;
}

/**
 * Validates redirect URLs to prevent open-redirect vulnerabilities
 * and enforce role boundaries.
 */
function getSafeRedirectUrl(
  target: string | null | undefined,
  userRole: string,
): string {
  const role = (userRole || "").toLowerCase();
  const defaultPath = role === "admin" || role === "manager" ? "/manager" : "/staff";

  if (!target) return defaultPath;

  try {
    const decoded = decodeURIComponent(target).trim();

    // Must start with single '/' and not protocol-relative '//' or '/\'
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.startsWith("/\\")) {
      return defaultPath;
    }

    // Disallow protocols (javascript:, http:, https:) or path traversal
    if (decoded.includes(":") || decoded.includes("..")) {
      return defaultPath;
    }

    // Prevent loops back to auth pages
    if (decoded.startsWith("/login") || decoded.startsWith("/register")) {
      return defaultPath;
    }

    // Enforce role-based dashboard access
    if (role === "staff" && decoded.startsWith("/manager")) {
      return "/staff";
    }
    if ((role === "admin" || role === "manager") && decoded.startsWith("/staff")) {
      return "/manager";
    }

    return decoded;
  } catch {
    return defaultPath;
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isExpired = searchParams?.get("expired") === "1";
  const redirectParam = searchParams?.get("redirect");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      resetLogoutState();
      writeAuth(token, user, true);

      // Redirect safely to intended destination or role default
      const destination = getSafeRedirectUrl(redirectParam, user.role || "");
      router.push(destination);
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
        <Image
          src="/images/logo.svg"
          alt="Event Management"
          width={150}
          height={150}
          priority
          className="h-32 w-32 object-contain"
        />
      </div>

      {/* Card */} 
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-6 shadow-2xl shadow-black/30 sm:p-8">
      
        {/* Session expired notification */}
        {isExpired && !error && (
          <div className="mt-2 flex items-start gap-3 rounded-xl border border-amber-800/60 bg-amber-950/40 p-3.5 text-amber-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-sm font-medium">Your session has expired. Please sign in again.</p>
          </div>
        )}

        {/* Error message */} 
        {error && ( 
          <div className="mt-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3"> 
            <p className="text-sm text-red-400">{error}</p> 
          </div> 
        )} 
      
        {/* Form */} 
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" >
          <Input 
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value) }
            leftIcon={ <Mail size={18} className="text-[#D2B47A]" /> }
            variant="dark"
            required
            autoComplete="email" 
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            value={password} onChange={(event) => setPassword(event.target.value) }
            leftIcon={ <LockKeyhole size={18} className="text-[#D2B47A]" /> }
            variant="dark"
            rightIcon={ <button type="button" onClick={() => setShowPassword((previous) => !previous) }
            aria-label={ showPassword ? "Hide password" : "Show password" }
            className="pointer-events-auto rounded-md p-1 text-gray-500 transition hover:text-[#D2B47A]" >{showPassword ? ( <EyeOff size={18} /> ) : ( <Eye size={18} /> )} </button> }
            required
            autoComplete="current-password" 
          />
          
          <Button
            type="submit"
            className="w-full bg-[#D2B47A] text-[#171717] hover:bg-[#C2A366]"
            disabled={loading} >
            {loading ? ( "Signing in..." ) : ( <> Sign In <ArrowRight size={17} /> </> )}
          </Button>
        </form>

        {/* Staff / Manager information */}
        <div className="mt-6 rounded-xl border border-[#3A3327] bg-[#201D18] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#D2B47A]"/>
            
            <div className="w-full">

              <p className="text-sm font-semibold text-gray-200"> Manager & Staff Access </p>
              <p className="mt-1 text-xs leading-5 text-gray-500"> Click below to auto-fill credentials for testing: </p>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { 
                    setEmail("admin@eventmanagement.com");
                    setPassword("admin123"); 
                  }}
                  className="rounded-lg bg-[#D2B47A]/10 px-2.5 py-1 text-xs font-medium text-[#D2B47A] transition hover:bg-[#D2B47A]/20"
                  >
                  Manager: admin@eventmanagement.com
                </button>
                  
                <button
                  type="button"
                  onClick={() => { 
                    setEmail("staff@eventmanagement.com");
                    setPassword("staff123");
                  }}
                  className="rounded-lg bg-[#D2B47A]/10 px-2.5 py-1 text-xs font-medium text-[#D2B47A] transition hover:bg-[#D2B47A]/20" 
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
        <Link href="/" className="text-sm text-gray-500 transition hover:text-[#D2B47A]" >
          ← Back to website
        </Link>
      </div>
    </div> 
  );
};