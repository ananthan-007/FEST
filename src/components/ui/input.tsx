import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#3A291B]/90 bg-[#141311] px-4 py-2 text-sm text-[#F5EFE6] placeholder:text-[#A89F91]/60 transition-colors focus-visible:outline-none focus-visible:border-[#CC892F] focus-visible:ring-1 focus-visible:ring-[#CC892F]/70 disabled:cursor-not-allowed disabled:opacity-45",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
