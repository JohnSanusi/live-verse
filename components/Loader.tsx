"use client";

import React, { useEffect, useState } from "react";

export const Loader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 500); // Wait for fade out transition
    }, 2000); // 2 seconds display time

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
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
