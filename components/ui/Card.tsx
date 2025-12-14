import React from "react";

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`rounded-xl border border-border bg-secondary/50 p-4 ${className}`}>
      {children}
    </div>
  );
};
