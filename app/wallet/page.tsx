"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Coins, TrendingUp, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

const COIN_PACKAGES = [
  { amount: 100, price: "$0.99", popular: false },
  { amount: 500, price: "$4.99", popular: true },
  { amount: 1000, price: "$9.99", popular: false },
  { amount: 5000, price: "$49.99", popular: false },
];

export default function WalletPage() {
  const { currentUser, purchaseCoins } = useApp();

  const handlePurchase = (amount: number, price: string) => {
    purchaseCoins(amount);
    alert(`Successfully purchased ${amount} coins for ${price}!`);
  };

  return (
    <div className="pb-20">
      <Header title="Wallet" />
      
      <main className="p-4 space-y-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Coins size={20} className="text-primary" />
              <span className="text-xs text-muted-foreground">Coins</span>
            </div>
            <p className="text-2xl font-bold text-primary">{currentUser.coins || 0}</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-400" />
              <span className="text-xs text-muted-foreground">Diamonds</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{currentUser.diamonds || 0}</p>
          </Card>
        </div>

        {/* Coin Packages */}
        <div>
          <h2 className="text-lg font-bold mb-3">Buy Coins</h2>
          <div className="grid grid-cols-2 gap-3">
            {COIN_PACKAGES.map((pkg) => (
              <Card 
                key={pkg.amount} 
                className={`p-4 relative ${pkg.popular ? "border-primary" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </div>
                )}
                <div className="text-center mb-3">
                  <p className="text-3xl font-bold text-primary mb-1">{pkg.amount}</p>
                  <p className="text-xs text-muted-foreground">Coins</p>
                </div>
                <Button 
                  className="w-full bg-primary text-primary-foreground"
                  onClick={() => handlePurchase(pkg.amount, pkg.price)}
                >
                  {pkg.price}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Diamond Info */}
        {(currentUser.diamonds || 0) > 0 && (
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-blue-400 mb-1">Creator Earnings</h3>
                <p className="text-xs text-muted-foreground">
                  You have {currentUser.diamonds} diamonds
                </p>
              </div>
              <WalletIcon size={24} className="text-blue-400" />
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              <ArrowUpRight size={16} className="mr-2" />
              Cash Out
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              1 Diamond = $0.10 USD
            </p>
          </Card>
        )}

        {/* Info */}
        <div className="bg-secondary/30 rounded-lg p-4">
          <h3 className="font-bold mb-2 text-sm">How it works</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Purchase coins to send gifts to creators</li>
            <li>• Creators receive diamonds from gifts</li>
            <li>• 10 coins = 1 diamond for creators</li>
            <li>• Cash out diamonds for real money</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
