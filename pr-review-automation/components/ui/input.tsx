import * as React from "react";

import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-md border border-line-strong bg-surface px-[13px] py-[11px] font-sans text-sm text-fg outline-none transition-[border-color,box-shadow] placeholder:text-fg-faint focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(91,54,232,0.14)] disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-critical-solid";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(fieldClass, className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClass, "min-h-20 resize-y leading-relaxed", className)}
      {...props}
    />
  );
}

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="select" className={cn(fieldClass, "pr-8", className)} {...props} />;
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("mb-1.5 block text-[12.5px] font-semibold text-fg-2", className)}
      {...props}
    />
  );
}

function Checkbox({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      className={cn("size-4 shrink-0 accent-violet-500", className)}
      {...props}
    />
  );
}

export { Checkbox, fieldClass, Input, Label, Select, Textarea };
