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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="h-32 w-32 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        
        {/* Inner Pulse */}
        <div className="absolute h-24 w-24 rounded-full bg-primary/20 animate-pulse"></div>
        
        {/* Logo Image */}
        <div className="absolute h-20 w-20 rounded-full overflow-hidden flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="mt-8 flex gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
      </div>
    </div>
  );
};
