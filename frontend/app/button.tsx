import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-xl font-semibold transition-colors",
        "bg-yellow-500 text-black hover:bg-yellow-600",
        className
      )}
      {...props}
    />
  );
}
