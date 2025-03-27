"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/services/auth";

interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterDialog() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const form = useForm<RegisterFormData>();
  const { register, handleSubmit, formState: { errors }, watch } = form;
  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      // Remove confirmPassword as it's not needed for the API
      const { confirmPassword, ...registerData } = data;
      
      const response = await AuthService.register(registerData);
      AuthService.setToken(response.access_token);
      
      // Close the dialog and redirect to habits page
      setOpen(false);
      router.push("/login");
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn-lg btn-primary bg-[#b36c33] hover:bg-[#a05c28] transition-all duration-200 shadow-sm hover:shadow-md">
          Get Started
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-amber-200/50 dark:border-amber-700/30">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-amber-800 dark:text-amber-300">
            Create your account
          </DialogTitle>
          <DialogDescription className="text-amber-700/80 dark:text-amber-400/80">
            Enter your details to start your habit tracking journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
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
              className="border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-900/10 focus-visible:ring-[#b36c33] dark:focus-visible:ring-[#c67c40] placeholder:text-amber-400/70 dark:placeholder:text-amber-500/40"
            />
            {errors.full_name && (
              <p className="text-sm text-red-600 mt-1">
                {errors.full_name.message}
              </p>
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
              className="border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-900/10 focus-visible:ring-[#b36c33] dark:focus-visible:ring-[#c67c40] placeholder:text-amber-400/70 dark:placeholder:text-amber-500/40"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
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
              className="border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-900/10 focus-visible:ring-[#b36c33] dark:focus-visible:ring-[#c67c40] placeholder:text-amber-400/70 dark:placeholder:text-amber-500/40"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
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
              className="border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-900/10 focus-visible:ring-[#b36c33] dark:focus-visible:ring-[#c67c40] placeholder:text-amber-400/70 dark:placeholder:text-amber-500/40"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full py-5 text-lg font-semibold mt-4 bg-[#b36c33] hover:bg-[#a05c28] transition-all duration-200 shadow-sm hover:shadow-md">
            Register
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}