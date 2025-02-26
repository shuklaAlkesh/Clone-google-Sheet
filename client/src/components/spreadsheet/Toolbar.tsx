import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CellStyle } from "@shared/schema";
import { Bold, Italic, Type } from "lucide-react";

interface ToolbarProps {
  onStyleChange: (style: Partial<CellStyle>) => void;
}

export function Toolbar({ onStyleChange }: ToolbarProps) {
  return (
    <div className="p-2 border-b flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onStyleChange({ bold: true })}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onStyleChange({ italic: true })}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Select
        onValueChange={(value) => onStyleChange({ fontSize: parseInt(value) })}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {[10, 12, 14, 16, 18, 20].map(size => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
