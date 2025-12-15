"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Search, Filter, ShoppingCart, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Sports", "Books"];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$89.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics",
    seller: "TechStore",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Electronics",
    seller: "GadgetHub",
  },
  {
    id: 3,
    name: "Designer Backpack",
    price: "$59.99",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Fashion",
    seller: "StyleCo",
  },
  {
    id: 4,
    name: "Coffee Maker",
    price: "$79.99",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop",
    category: "Home",
    seller: "HomeEssentials",
  },
  {
    id: 5,
    name: "Running Shoes",
    price: "$129.99",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "Sports",
    seller: "SportGear",
  },
  {
    id: 6,
    name: "Bestseller Novel",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    category: "Books",
    seller: "BookWorld",
  },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemCategory, setItemCategory] = useState("Electronics");
  const { createMarketplaceItem } = useApp();

  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateItem = () => {
    if (itemName.trim() && itemPrice.trim() && itemImage.trim()) {
      createMarketplaceItem(itemName, itemPrice, itemImage, itemCategory);
      setItemName("");
      setItemPrice("");
      setItemImage("");
      setItemCategory("Electronics");
      setShowCreateItem(false);
      alert("Marketplace item created successfully!");
    }
  };

  return (
    <div className="pb-20">
      <Header 
        title="Marketplace" 
        action={
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 rounded-full"
              onClick={() => setShowCreateItem(true)}
            >
              <Plus size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
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
              
              <Input
                placeholder="Image URL"
                className="bg-secondary/50 border-border"
                value={itemImage}
                onChange={(e) => setItemImage(e.target.value)}
              />
              
              <select
                className="w-full bg-secondary/50 border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                {CATEGORIES.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={handleCreateItem}
                disabled={!itemName.trim() || !itemPrice.trim() || !itemImage.trim()}
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-0 overflow-hidden border-none bg-secondary/30">
              <div className="aspect-square bg-muted overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 md:p-3">
                <h3 className="font-semibold text-xs md:text-sm mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-2">{product.seller}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-primary font-bold text-sm md:text-base">{product.price}</span>
                  <Button size="sm" className="h-6 md:h-7 px-2 md:px-3 text-[10px] md:text-xs rounded-full bg-primary text-primary-foreground">
                    Buy
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
