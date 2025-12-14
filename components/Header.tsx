import React from "react";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const Header = ({ title, action }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  );
};
