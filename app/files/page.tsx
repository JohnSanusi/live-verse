"use client";

import React from "react";
import { Header } from "@/components/Header";
import { FileCard } from "@/components/FileCard";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useApp } from "@/context/AppContext";

export default function FilesPage() {
  const { files, addFile } = useApp();

  return (
    <div className="pb-20 h-screen flex flex-col">
      <Header 
        title="Files" 
        action={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-full hover:bg-primary/20 hover:text-primary"
            onClick={addFile}
          >
            <Plus size={24} />
          </Button>
        } 
      />
      
      <div className="p-4 space-y-4">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search files..." className="pl-10 bg-secondary/50 border-none" />
          </div>
          <Button variant="secondary" className="w-11 px-0">
            <Filter size={18} />
          </Button>
        </div>

        {/* Storage Info */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">Storage Used</p>
              <h3 className="text-xl font-bold text-foreground">12.5 GB <span className="text-sm text-muted-foreground font-normal">/ 50 GB</span></h3>
            </div>
            <span className="text-xs font-bold text-primary">25%</span>
          </div>
          <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-primary rounded-full"></div>
          </div>
        </div>

        {/* Recent Files */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Recent Files</h2>
          <div className="space-y-3">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
