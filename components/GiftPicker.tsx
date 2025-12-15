"use client";

import React, { useState } from "react";
import { Gift, GIFT_TYPES } from "@/context/AppContext";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GiftPickerProps {
  onClose: () => void;
  onSendGift: (giftId: string) => void;
  userCoins: number;
}

export const GiftPicker = ({ onClose, onSendGift, userCoins }: GiftPickerProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center">
      <div className="bg-background border-t md:border border-border rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Send a Gift</h2>
            <p className="text-sm text-muted-foreground">Your coins: {userCoins} 💰</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {GIFT_TYPES.map((gift) => {
            const canAfford = userCoins >= gift.cost;
            return (
              <button
                key={gift.id}
                onClick={() => {
                  if (canAfford) {
                    onSendGift(gift.id);
                    onClose();
                  }
                }}
                disabled={!canAfford}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  canAfford
                    ? "border-border hover:border-primary hover:bg-primary/10 cursor-pointer"
                    : "border-border/50 opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-4xl">{gift.emoji}</span>
                <span className="text-xs font-medium text-center">{gift.name}</span>
                <span className="text-xs text-primary font-bold">{gift.cost} 💰</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
