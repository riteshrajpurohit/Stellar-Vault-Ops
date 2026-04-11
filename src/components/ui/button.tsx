import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 sm:rounded-full sm:text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 text-slate-950 shadow-[0_14px_30px_rgba(45,212,191,0.24)] hover:brightness-110 hover:shadow-[0_16px_36px_rgba(45,212,191,0.28)]",
        secondary:
          "border border-white/10 bg-white/6 text-slate-50 hover:bg-white/10",
        ghost:
          "text-slate-300 hover:bg-white/6 hover:text-slate-50 active:scale-[0.99]",
        outline:
          "border border-white/12 bg-transparent text-slate-100 hover:bg-white/6",
      },
      size: {
        default: "h-9 px-4 sm:h-11 sm:px-5 sm:py-2.5",
        sm: "h-8 px-3 sm:h-9 sm:px-4",
        lg: "h-10 px-5 sm:h-12 sm:px-6",
        icon: "h-8 w-8 sm:h-10 sm:w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
