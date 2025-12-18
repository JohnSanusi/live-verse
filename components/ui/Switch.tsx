"use client";

import React from "react";
import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = ({ checked, onCheckedChange, disabled }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 outline-none
        ${
          checked
            ? "bg-primary shadow-[0_0_12px_-2px_rgba(var(--primary-rgb),0.5)]"
            : "bg-muted"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:brightness-110 active:scale-95"
        }
      `}
    >
      <motion.span
        initial={false}
        animate={{
          x: checked ? 20 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`
          pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform
          ${checked ? "shadow-primary/20" : "shadow-black/10"}
        `}
      />
    </button>
  );
};
