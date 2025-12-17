import React from "react";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const Header = ({ title, action, className }: HeaderProps) => {
  return (
    <header
      className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl ${
        className || ""
      }`}
    >
      <h1 className="text-xl font-black tracking-tight text-foreground">
        {title}
      </h1>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
};
