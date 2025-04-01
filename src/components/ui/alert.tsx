import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid items-start gap-y-0.5 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-red-100 border-red-300 text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        info: "bg-blue-100 border-blue-300 text-blue-800 [&>svg]:text-blue-600",
        success: "bg-green-100 border-green-300 text-green-800 [&>svg]:text-green-600",
        warning: "bg-yellow-100 border-yellow-300 text-yellow-800 [&>svg]:text-yellow-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  onClose,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & { onClose?: () => void }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-gray-200 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {props.children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }