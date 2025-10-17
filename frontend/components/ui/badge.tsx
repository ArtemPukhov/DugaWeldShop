import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-gray-300 text-gray-900 bg-white",
        success:
          "border-transparent bg-green-200 text-green-900 hover:bg-green-300 border border-green-300",
        warning:
          "border-transparent bg-yellow-200 text-yellow-900 hover:bg-yellow-300 border border-yellow-300",
        info:
          "border-transparent bg-blue-200 text-blue-900 hover:bg-blue-300 border border-blue-300",
        pending:
          "border-transparent bg-yellow-200 text-yellow-900 hover:bg-yellow-300 border border-yellow-300",
        confirmed:
          "border-transparent bg-blue-200 text-blue-900 hover:bg-blue-300 border border-blue-300",
        processing:
          "border-transparent bg-purple-200 text-purple-900 hover:bg-purple-300 border border-purple-300",
        shipped:
          "border-transparent bg-indigo-200 text-indigo-900 hover:bg-indigo-300 border border-indigo-300",
        delivered:
          "border-transparent bg-green-200 text-green-900 hover:bg-green-300 border border-green-300",
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
