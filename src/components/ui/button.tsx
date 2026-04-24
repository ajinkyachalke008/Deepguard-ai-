import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono tracking-[0.1em] uppercase text-sm font-bold transition-all duration-150 disabled:pointer-events-none disabled:opacity-25 [&_svg:not([class*='size-'])]:size-4 outline-none relative overflow-hidden group cursor-pointer [clip-path:polygon(0_8px,8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px))]",
  {
    variants: {
      variant: {
        default: `
          bg-forensic-cyan/10 text-primary border border-primary/50
          hover:bg-primary/20 hover:border-primary hover:text-primary
          shadow-[inset_0_1px_0_0_rgba(0,255,255,0.1),0_0_10px_rgba(0,255,255,0.1)]
          hover:shadow-[inset_0_1px_0_0_rgba(0,255,255,0.2),0_0_20px_rgba(0,255,255,0.3)]
          before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent,rgba(0,255,255,0.15),transparent)]
          before:-translate-x-full hover:before:translate-x-full before:duration-500
          after:absolute after:inset-0 after:bg-[linear-gradient(0deg,transparent_0%,rgba(0,255,255,0.05)_50%,transparent_100%)]
          after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300
          hover:animate-glitch
        `,
        destructive: `
          bg-forensic-red/10 text-forensic-red border border-forensic-red/50
          hover:bg-forensic-red/20 hover:border-forensic-red
          shadow-[inset_0_1px_0_0_rgba(255,0,0,0.1),0_0_10px_rgba(255,0,0,0.1)]
          hover:shadow-[inset_0_1px_0_0_rgba(255,0,0,0.2),0_0_20px_rgba(255,0,0,0.3)]
          before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent,rgba(255,0,0,0.15),transparent)]
          before:-translate-x-full hover:before:translate-x-full before:duration-500
          after:absolute after:inset-0 after:bg-[linear-gradient(0deg,transparent_0%,rgba(255,0,0,0.05)_50%,transparent_100%)]
          after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300
          hover:animate-glitch
        `,
        outline: "border border-white/10 bg-transparent hover:bg-white/5 hover:text-accent-foreground [clip-path:none] font-sans tracking-normal font-medium capitalize",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 [clip-path:none] font-sans tracking-normal font-medium capitalize",
        ghost: "hover:bg-accent hover:text-accent-foreground [clip-path:none] font-sans tracking-normal font-medium capitalize",
        link: "text-primary underline-offset-4 hover:underline [clip-path:none] font-sans tracking-normal font-medium capitalize",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1.5 text-[10px]",
        lg: "h-12 px-8 py-3 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-slot="button"
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }