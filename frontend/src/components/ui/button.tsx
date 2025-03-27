import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#d58b4b] text-white hover:bg-[#c07a3a] dark:bg-[#d58b4b] dark:hover:bg-[#e59c5c]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
        outline:
          "border border-amber-200 bg-background hover:bg-amber-100 hover:text-amber-900 dark:border-amber-800 dark:hover:bg-amber-900/30 dark:hover:text-amber-300",
        secondary:
          "bg-amber-100 text-amber-900 hover:bg-amber-200/80 dark:bg-amber-800/30 dark:text-amber-100 dark:hover:bg-amber-700/50",
        ghost: "hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/30 dark:hover:text-amber-300",
        link: "text-[#d58b4b] underline-offset-4 hover:underline dark:text-[#e59c5c]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }