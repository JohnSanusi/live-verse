import React from "react";
import { Folder, FileText, Image as ImageIcon, MoreVertical, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface FileCardProps {
  file: {
    id: string;
    name: string;
    type: "folder" | "document" | "image";
    size?: string;
    items?: number;
    date: string;
  };
}

export const FileCard = ({ file }: FileCardProps) => {
  const { name, type, size, items, date } = file;

  const getIcon = () => {
    switch (type) {
      case "folder":
        return <Folder className="text-primary" size={32} />;
      case "image":
        return <ImageIcon className="text-blue-400" size={32} />;
      default:
        return <FileText className="text-gray-400" size={32} />;
    }
  };

  return (
    <Card className="p-3 flex items-center justify-between hover:bg-secondary/80 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {type === "folder" ? `${items} items` : size} • {date}
          </p>
        </div>
      </div>
      
      <div className="flex items-center">
        {type !== "folder" && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-primary">
            <Download size={18} />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground">
          <MoreVertical size={18} />
        </Button>
      </div>
    </Card>
  );
};
