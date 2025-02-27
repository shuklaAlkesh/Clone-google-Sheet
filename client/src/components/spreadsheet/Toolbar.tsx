
import { Button } from "@/components/ui/button";
import { StyleEditor } from "./StyleEditor";
import { Trash2, Save, Upload, Edit } from "lucide-react";
import { CellStyle } from "@shared/schema";

interface ToolbarProps {
  onStyleChange: (style: Partial<CellStyle>) => void;
  onDeleteRow?: (rowIndex: number) => void;
  selectedCell?: string;
  onSave: () => void;
  onLoad: () => void;
  onRename: () => void;
}

export function Toolbar({
  onStyleChange,
  onDeleteRow,
  selectedCell,
  onSave,
  onLoad,
  onRename,
}: ToolbarProps) {
  const handleDeleteRow = () => {
    if (onDeleteRow && selectedCell) {
      const rowIndex = parseInt(selectedCell.match(/\d+/)?.[0] || "0");
      onDeleteRow(rowIndex);
    }
  };

  return (
    <div className="flex gap-2 p-2 border-b">
      <StyleEditor onChange={onStyleChange} />
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDeleteRow}
        disabled={!selectedCell}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onSave}>
        <Save className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onLoad}>
        <Upload className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onRename}>
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}
