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
          bg-gradient-to-b from-[#2a2410] to-[#120f04]
          text-yellow-400 border border-yellow-700/30
          hover:bg-gradient-to-b hover:from-[#3a3010] hover:to-[#1a1404] hover:text-yellow-300
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-4px_1px_-3px_rgba(155,129,0,0.4),0_0_10px_rgba(255,200,0,0.1)]
          hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-4px_1px_-3px_#9b8100,0_0_20px_rgba(255,200,0,0.4)]
          transition-all duration-300 [clip-path:none] rounded-xl
          before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]
          before:opacity-30
        `,
        destructive: `
          bg-gradient-to-b from-[#2a1010] to-[#120404]
          text-red-400 border border-red-700/30
          hover:bg-gradient-to-b hover:from-[#3a1010] hover:to-[#1a0404] hover:text-red-300
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-4px_1px_-3px_rgba(155,0,0,0.4),0_0_10px_rgba(255,0,0,0.1)]
          hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-4px_1px_-3px_#9b0000,0_0_20px_rgba(255,0,0,0.4)]
          transition-all duration-300 [clip-path:none] rounded-xl
          before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]
          before:opacity-30
        `,
        outline: `
          bg-gradient-to-b from-[#151515] to-[#050505]
          text-yellow-500 border border-yellow-700/50
          hover:bg-gradient-to-b hover:from-[#252010] hover:to-[#0f0a05] hover:text-yellow-400
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_-2px_1px_-1px_rgba(155,129,0,0.2),0_0_5px_rgba(255,200,0,0.05)]
          hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-3px_1px_-2px_#9b8100,0_0_10px_rgba(255,200,0,0.2)]
          transition-all duration-300 [clip-path:none] rounded-xl font-sans tracking-normal capitalize
          before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]
          before:opacity-30
        `,
        secondary: `
          bg-gradient-to-b from-[#202020] to-[#0a0a0a]
          text-gray-300 border border-gray-700/50
          hover:bg-gradient-to-b hover:from-[#2a2a2a] hover:to-[#1a1a1a] hover:text-white
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-3px_1px_-2px_rgba(100,100,100,0.4),0_0_10px_rgba(0,0,0,0.5)]
          hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-3px_1px_-2px_#666666,0_0_15px_rgba(0,0,0,0.8)]
          transition-all duration-300 [clip-path:none] rounded-xl font-sans tracking-normal capitalize
          before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]
          before:opacity-30
        `,
        ghost: `
          bg-transparent text-yellow-500/70 border border-transparent
          hover:bg-gradient-to-b hover:from-[#252010] hover:to-[#0f0a05] hover:text-yellow-400 hover:border-yellow-700/30
          hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_-2px_1px_-1px_#9b8100,0_0_10px_rgba(255,200,0,0.1)]
          transition-all duration-300 [clip-path:none] rounded-xl font-sans tracking-normal capitalize
        `,
        link: "text-yellow-500 underline-offset-4 hover:underline [clip-path:none] font-sans tracking-normal font-medium capitalize",
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
        <span className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-xl"></span>
        <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {variant !== 'link' && variant !== 'ghost' && (
            <span className="relative flex h-2 w-2 mr-1 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === 'destructive' ? 'bg-red-400' : variant === 'secondary' ? 'bg-gray-400' : 'bg-yellow-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${variant === 'destructive' ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]' : variant === 'secondary' ? 'bg-gray-500 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(255,200,0,0.8)]'}`}></span>
            </span>
          )}
          {children}
        </span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }