import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E3B464]/70 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        gold: "gold-gradient-button",
        bronze:
          "bg-[#242321] text-[#F4DD9F] border border-[#64401F]/70 hover:bg-[#3A291B]/70 hover:border-[#E3B464]/60",
        outline:
          "border border-[#64401F]/60 bg-[#0D0C0A]/70 text-[#F5EFE6] hover:border-[#E3B464]/70 hover:bg-[#242321]/80",
        ghost:
          "text-[#A89F91] hover:text-[#F4DD9F] hover:bg-[#242321]/60",
        destructive:
          "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-8 px-4 text-[11px]",
        lg: "h-12 px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
