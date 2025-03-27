import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#d58b4b] text-white hover:bg-[#c07a3a]",
        secondary:
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-800/40 dark:text-amber-200 dark:hover:bg-amber-800/60",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-amber-800 border-amber-300 dark:text-amber-200 dark:border-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }