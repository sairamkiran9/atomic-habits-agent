import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-800 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-[#d58b4b]/50 dark:placeholder:text-[#e59c5c]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d58b4b] dark:focus-visible:ring-[#e59c5c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }