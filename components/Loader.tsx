"use client";

import React from "react";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background opacity-100">
      <div className="h-32 w-32 rounded-full overflow-hidden flex items-center justify-center animate-pulse">
        <img
          src="/logo.png"
          alt="Logo"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
