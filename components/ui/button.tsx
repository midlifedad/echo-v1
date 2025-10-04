import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-label font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-primary-400/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary-500 text-text-inverse shadow-sm hover:bg-primary-600 active:bg-primary-700",
        destructive:
          "bg-error-500 text-text-inverse shadow-sm hover:bg-error-600 active:bg-error-700",
        outline:
          "border border-default bg-background-surface shadow-sm hover:bg-background-elevated hover:border-strong",
        secondary:
          "bg-secondary-500 text-text-inverse shadow-sm hover:bg-secondary-600 active:bg-secondary-700",
        ghost:
          "hover:bg-background-surface hover:text-text-primary",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
