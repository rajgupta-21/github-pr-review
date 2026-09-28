import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

/*
  Mergegate buttons. Violet `primary` is the one primary action on a surface —
  never use it twice in the same region. 44px minimum target at size "md".
*/
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 border font-sans font-semibold whitespace-nowrap no-underline transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-violet-500/25 disabled:pointer-events-none disabled:border-transparent disabled:bg-[#E3E1DC] disabled:text-[#7E7A8C] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-violet-500 text-white hover:bg-violet-600 hover:text-white",
        secondary:
          "border-line-control bg-surface text-fg hover:bg-surface-sunken hover:text-fg",
        tertiary:
          "border-line-strong bg-surface font-normal text-fg-2 hover:bg-surface-sunken hover:text-fg",
        destructive:
          "border-critical-line bg-surface text-critical hover:bg-critical-fill hover:text-critical",
        dark: "border-transparent bg-fg text-white hover:bg-[#2A2838] hover:text-white",
        ghost:
          "border-transparent bg-transparent font-medium text-fg-muted hover:bg-surface-hover hover:text-fg",
        /* outline button on ink chrome (top bars, marketing nav) */
        ink: "border-ink-line-strong bg-transparent font-normal text-ink-fg hover:bg-ink-750 hover:text-ink-fg",
        link: "h-auto border-transparent bg-transparent p-0 font-medium text-violet-600 hover:text-violet-700",
      },
      size: {
        sm: "h-9 rounded-[9px] px-3 text-[13.5px] [&_svg:not([class*='size-'])]:size-[15px]",
        md: "h-11 rounded-md px-[17px] text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-[50px] rounded-[12px] px-5 text-[15px] [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-10 rounded-[11px] p-0 [&_svg:not([class*='size-'])]:size-[18px]",
        "icon-sm": "size-[34px] rounded-[9px] p-0 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || loading}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
