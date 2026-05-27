import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface FlexibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;

  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  size?: "sm" | "default" | "lg" | "icon";

  loading?: boolean;

  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;

  fullWidth?: boolean;
}

export function DynamicButton({
  children,
  variant = "default",
  size = "default",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: FlexibleButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        `
        rounded-2xl
        font-medium
        transition-all
        duration-300
        active:scale-[0.98]
        cursor-pointer
        `,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && (
            <span className="mr-2 flex items-center">
              {leftIcon}
            </span>
          )}

          {children}

          {rightIcon && (
            <span className="ml-2 flex items-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </Button>
  );
}