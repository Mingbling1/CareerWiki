import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toggleGroupVariants = cva(
  "inline-flex items-center rounded-lg border border-[var(--input)] bg-transparent shadow-sm",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8",
        lg: "h-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const toggleGroupItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[var(--accent)] data-[state=on]:text-[var(--accent-foreground)] first:rounded-l-md last:rounded-r-md border-r border-[var(--input)] last:border-r-0",
  {
    variants: {
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2.5",
        lg: "h-10 px-3.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toggleGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toggleGroupVariants({ size, className }))}
      {...props}
    />
  )
)
ButtonGroup.displayName = "ButtonGroup"

interface ButtonGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleGroupItemVariants> {}

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(toggleGroupItemVariants({ size, className }))}
      {...props}
    />
  )
)
ButtonGroupItem.displayName = "ButtonGroupItem"

export { ButtonGroup, ButtonGroupItem }
