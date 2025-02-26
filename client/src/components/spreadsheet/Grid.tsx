import { useRef, useState } from "react";
import { Cell } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { positionToAddress, addressToPosition, CellPosition } from "@/lib/spreadsheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Minus, GripVertical } from "lucide-react";

interface GridProps {
  data: Record<string, Cell>;
  rowCount: number;
  colCount: number;
  onCellChange: (address: string, value: string) => void;
  onCellSelect: (address: string) => void;
}

export function Grid({ data, rowCount, colCount, onCellChange, onCellSelect }: GridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggingCell, setDraggingCell] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const startResizePos = useRef<number>(0);

  function handleCellClick(address: string) {
    setSelectedCell(address);
    onCellSelect(address);
  }

  function handleDoubleClick(address: string) {
    const cell = data[address];
    setEditValue(cell?.formula || cell?.value || "");
    setEditingCell(address);
  }

  function handleCellChange(address: string) {
    onCellChange(address, editValue);
    setEditingCell(null);
    setEditValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent, address: string) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCellChange(address);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue("");
    }
  }

  // Drag and Drop functionality
  function handleDragStart(e: React.DragEvent, address: string) {
    e.dataTransfer.setData('text/plain', data[address]?.formula || data[address]?.value || '');
    setDraggingCell(address);
  }

  function handleDrop(e: React.DragEvent, address: string) {
    e.preventDefault();
    if (draggingCell && draggingCell !== address) {
      const sourceValue = data[draggingCell]?.formula || data[draggingCell]?.value || '';
      onCellChange(address, sourceValue);
    }
    setDraggingCell(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  // Column/Row Resizing
  function startColumnResize(e: React.MouseEvent, col: number) {
    e.preventDefault();
    setResizingColumn(col);
    startResizePos.current = e.clientX;
  }

  function startRowResize(e: React.MouseEvent, row: number) {
    e.preventDefault();
    setResizingRow(row);
    startResizePos.current = e.clientY;
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (resizingColumn !== null) {
      const diff = e.clientX - startResizePos.current;
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: (prev[resizingColumn] || 128) + diff
      }));
      startResizePos.current = e.clientX;
    } else if (resizingRow !== null) {
      const diff = e.clientY - startResizePos.current;
      setRowHeights(prev => ({
        ...prev,
        [resizingRow]: (prev[resizingRow] || 32) + diff
      }));
      startResizePos.current = e.clientY;
    }
  }

  function handleMouseUp() {
    setResizingColumn(null);
    setResizingRow(null);
  }

  return (
    <ScrollArea className="h-full w-full">
      <div 
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Column Headers */}
        <div className="flex sticky top-0 z-10 bg-background">
          <div className="w-12 h-8 border-r border-b flex-shrink-0" /> {/* Corner */}
          {Array.from({ length: colCount }).map((_, col) => (
            <div 
              key={col} 
              className="border-r border-b flex items-center justify-center bg-muted flex-shrink-0 relative"
              style={{ width: columnWidths[col] || 128 }}
            >
              <div className="flex items-center">
                {String.fromCharCode(65 + col)}
                <div
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400"
                  onMouseDown={(e) => startColumnResize(e, col)}
                />
              </div>
            </div>
          ))}
          <Button size="sm" className="ml-2" onClick={() => {/* Add column handler */}}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Rows */}
        {Array.from({ length: rowCount }).map((_, row) => (
          <div key={row} className="flex">
            {/* Row Header */}
            <div 
              className="w-12 border-r border-b flex items-center justify-center bg-muted sticky left-0 flex-shrink-0 relative"
              style={{ height: rowHeights[row] || 32 }}
            >
              <span>{row + 1}</span>
              <div
                className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-400"
                onMouseDown={(e) => startRowResize(e, row)}
              />
            </div>

            {/* Cells */}
            {Array.from({ length: colCount }).map((_, col) => {
              const address = positionToAddress({ row, col });
              const cell = data[address] || { value: "", style: {} };
              const isSelected = address === selectedCell;
              const isEditing = address === editingCell;
              const isDragging = address === draggingCell;

              return (
                <div
                  key={col}
                  className={cn(
                    "border-r border-b flex-shrink-0 relative",
                    isSelected && "bg-blue-50 ring-2 ring-blue-400",
                    isDragging && "opacity-50"
                  )}
                  style={{ 
                    width: columnWidths[col] || 128,
                    height: rowHeights[row] || 32
                  }}
                  onClick={() => handleCellClick(address)}
                  onDoubleClick={() => handleDoubleClick(address)}
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, address)}
                  onDrop={(e) => handleDrop(e, address)}
                  onDragOver={handleDragOver}
                >
                  {isEditing ? (
                    <Input
                      className="h-full w-full border-0 absolute inset-0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleCellChange(address)}
                      onKeyDown={(e) => handleKeyDown(e, address)}
                      autoFocus
                    />
                  ) : (
                    <div
                      className={cn(
                        "px-2 h-full flex items-center overflow-hidden",
                        cell.style?.bold && "font-bold",
                        cell.style?.italic && "italic"
                      )}
                      style={{
                        color: cell.style?.color,
                        fontSize: cell.style?.fontSize,
                      }}
                    >
                      <span className="truncate">{cell.value || ""}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Add Row Button */}
        <Button size="sm" className="mt-2" onClick={() => {/* Add row handler */}}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </ScrollArea>
  );
}