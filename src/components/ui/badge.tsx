import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        gold: "border-[#CC892F]/45 bg-[#CC892F]/15 text-[#F4DD9F]",
        bronze: "border-[#64401F]/60 bg-[#242321] text-[#E3B464]",
        outline: "border-[#3A291B] bg-transparent text-[#A89F91]",
        success: "border-emerald-500/35 bg-emerald-500/15 text-emerald-300",
        warning: "border-amber-500/35 bg-amber-500/15 text-amber-300",
        danger: "border-red-500/35 bg-red-500/15 text-red-300",
      },
    },
    defaultVariants: {
      variant: "gold",
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
