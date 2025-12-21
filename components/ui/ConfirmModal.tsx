"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false,
}: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-card border border-border rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    type === "danger"
                      ? "bg-red-500/10 text-red-500"
                      : type === "warning"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-xl font-black mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {message}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl font-bold h-12"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={type === "danger" ? "destructive" : "primary"}
                  className="flex-1 rounded-xl font-bold h-12 shadow-lg"
                  onClick={onConfirm}
                  isLoading={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
