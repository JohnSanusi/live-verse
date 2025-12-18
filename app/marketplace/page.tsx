"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Search, Filter, ShoppingCart, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { EliteBadge } from "@/components/EliteBadge";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Sports", "Books"];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemCategory, setItemCategory] = useState("Electronics");
  const { createMarketplaceItem, marketplaceItems } = useApp();
  const { showToast, confirm } = useToast();

  const products = marketplaceItems;

  const filteredProducts = products.filter((product: any) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [itemFile, setItemFile] = useState<File | null>(null);

  const handleCreateItem = () => {
    if (itemName.trim() && itemPrice.trim() && (itemFile || itemImage)) {
      createMarketplaceItem(
        itemName,
        itemPrice,
        itemFile || itemImage,
        itemCategory
      );
      setItemName("");
      setItemPrice("");
      setItemImage("");
      setItemFile(null);
      setItemCategory("Electronics");
      setShowCreateItem(false);
      showToast("Item listed successfully!", "success");
    }
  };

  const handleBuy = (product: any) => {
    confirm({
      title: "Confirm Purchase",
      message: `Are you sure you want to buy ${product.name} for ${product.price}?`,
      confirmText: "Buy Now",
      onConfirm: () => {
        showToast("Purchase successful!", "success");
      },
    });
  };

  return (
    <div className="pb-20">
      <Header
        title="Marketplace"
        action={
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="h-9 px-4 rounded-full flex items-center gap-2 font-bold"
              onClick={() => setShowCreateItem(true)}
            >
              <Plus size={18} />
              <span className="text-xs">Sell</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
              onClick={() => showToast("Cart is empty", "info")}
            >
              <ShoppingCart size={20} />
            </Button>
          </div>
        }
      />

      {/* Create Item Modal */}
      {showCreateItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">List Item</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowCreateItem(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Item name"
                className="bg-secondary/50 border-border"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />

              <Input
                placeholder="Price (e.g., $99.99)"
                className="bg-secondary/50 border-border"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />

              <div className="flex gap-2">
                <Input
                  type="file"
                  id="market-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setItemFile(file);
                      setItemImage(URL.createObjectURL(file));
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  className="w-full border-dashed border-2 bg-secondary/20"
                  onClick={() =>
                    document.getElementById("market-upload")?.click()
                  }
                >
                  {itemFile ? itemFile.name : "Upload Image"}
                </Button>
              </div>

              <select
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleCreateItem}
                disabled={
                  !itemName.trim() || !itemPrice.trim() || !itemImage.trim()
                }
              >
                List Item
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-secondary/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "primary" : "secondary"}
              size="sm"
              className="flex-shrink-0 rounded-full"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-0 overflow-hidden border-none bg-secondary/30"
            >
              <div className="aspect-square bg-muted overflow-hidden">
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground mb-2">
                    {product.seller ||
                      (product.profiles?.name ?? "Unknown Seller")}
                  </p>
                  {product.profiles?.is_verified && <EliteBadge size={10} />}
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-bold block">
                    {typeof product.price === "number"
                      ? `$${product.price.toFixed(2)}`
                      : product.price}
                  </span>
                  <Button
                    size="sm"
                    className="w-full h-9 text-xs rounded-xl bg-primary text-primary-foreground font-bold active-scale"
                    onClick={() => handleBuy(product)}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            No products found
          </div>
        )}
      </main>
    </div>
  );
}
