"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/services";
import { useDemoMode } from '@/components/providers/demo-mode-provider';
import { AlertCircle } from 'lucide-react';

// Reusing the same interface from the dialog component
interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const form = useForm<RegisterFormData>();
  const { register, handleSubmit, formState: { errors }, watch } = form;
  const password = watch("password");
  const { isDemoMode, enableDemoMode } = useDemoMode();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      // Remove confirmPassword as it's not needed for the API
      const { confirmPassword, ...registerData } = data;
      
      const response = await auth.register(registerData);
      auth.setToken(response.access_token);
      
      // Redirect to login page after successful registration
      router.push("/login");
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    enableDemoMode();
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-[#f7e8dc] px-4 dot-pattern-dense">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-amber-200/50 dark:bg-gray-900 dark:border-amber-700/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-300">Create your account</h1>
          <p className="text-amber-700/80 dark:text-amber-400/80 mt-2">
            Enter your details to start your habit tracking journey.
          </p>
        </div>
        
        {isDemoMode && (
          <div className="flex items-start gap-3 p-4 bg-amber-100 border border-amber-200 rounded-lg text-amber-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Demo Mode Active</p>
              <p className="text-sm mt-1">
                You're in demo mode. Registration isn't needed - 
                <Link href="/habits" className="underline font-medium">
                  click here to go directly to the habits dashboard
                </Link>.
              </p>
            </div>
          </div>
        )}

        {!isDemoMode && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/10 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Name
              </label>
              <Input
                id="name"
                type="text"
                {...register("full_name", { required: "Name is required" })}
                placeholder="Enter your name"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-amber-800 dark:text-amber-300">
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
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
                  },
                })}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: value =>
                    value === password || "The passwords do not match"
                })}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Register
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                Already have an account?{" "}
                <Link href="/login" className="text-[#d58b4b] font-medium hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        )}
        
        {!isDemoMode && (
          <div className="flex flex-col items-center space-y-3 border-t border-amber-200 dark:border-amber-800/30 pt-4 mt-6">
            <p className="text-sm text-amber-700/70 dark:text-amber-400/70">Don't want to create an account?</p>
            <Button variant="outline" onClick={handleDemoClick}>
              Try Demo Mode
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}