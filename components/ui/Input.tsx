import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={`flex h-11 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};
