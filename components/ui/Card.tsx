import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div
      className={`rounded-xl border border-border bg-secondary/50 p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
