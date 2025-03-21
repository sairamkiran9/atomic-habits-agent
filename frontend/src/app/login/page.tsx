"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/services";
import { useState, useEffect } from "react";
import { useDemoMode } from "@/components/providers/demo-mode-provider";
import { AlertCircle } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormData>();
  const { isDemoMode } = useDemoMode();

  // Check if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push('/habits');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Set demo user email for convenience in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setValue("email", "demo@example.com");
      setValue("password", "demo-password");
    }
  }, [isDemoMode, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      setIsLoading(true);
      const response = await auth.login(data);
      auth.setToken(response.access_token);
      
      // After successful login, redirect to habits page
      router.push("/habits");
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : "Failed to login. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-violet-100">
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {isDemoMode && (
            <div className="flex items-start gap-3 p-4 bg-amber-100 border border-amber-200 rounded-lg text-amber-800">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Demo Mode Active</p>
                <p className="text-sm mt-1">
                  You're in demo mode. Any email and password will work for login.
                  We've pre-filled demo credentials for your convenience.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} 
                className="space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
            {error && (
              <div className="p-3 rounded bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter your email"
                className="bg-white/90"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  ...(isDemoMode ? {} : {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    }
                  })
                })}
                placeholder="Enter your password"
                className="bg-white/90"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-violet-600 hover:text-violet-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="text-violet-600 hover:text-violet-700 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>

          {!isDemoMode && (
            <div className="text-center">
              <Link 
                href="/?demo=true" 
                className="text-sm text-violet-600 hover:text-violet-700 hover:underline"
              >
                Want to try a demo without signing up?
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Atomic Habits Tracker. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}