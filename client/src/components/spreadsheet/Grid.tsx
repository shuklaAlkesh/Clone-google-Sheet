import { Cell } from "@shared/schema";
import { createEmptyCell } from "@/lib/spreadsheet";
import { evaluateFormula } from "@/lib/formulas";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GridProps {
  data: Record<string, Cell>;
  rowCount: number;
  colCount: number;
  onCellChange: (address: string, value: string) => void;
  onCellSelect: (address: string) => void;
  onDeleteRow?: (rowIndex: number) => void;
}

export function Grid({ 
  data, 
  rowCount, 
  colCount, 
  onCellChange, 
  onCellSelect,
  onDeleteRow 
}: GridProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

  const handleResizeStart = (e: React.MouseEvent, type: 'col' | 'row', index: number) => {
    setResizing(true);
    setStartPos(type === 'col' ? e.clientX : e.clientY);
  };

  const handleResizeMove = (e: React.MouseEvent, type: 'col' | 'row', index: number) => {
    if (!resizing) return;

    const diff = (type === 'col' ? e.clientX : e.clientY) - startPos;
    if (type === 'col') {
      setColWidths(prev => ({
        ...prev,
        [index]: Math.max(80, (prev[index] || 100) + diff)
      }));
    } else {
      setRowHeights(prev => ({
        ...prev,
        [index]: Math.max(24, (prev[index] || 30) + diff)
      }));
    }
    setStartPos(type === 'col' ? e.clientX : e.clientY);
  };

  const handleResizeEnd = () => {
    setResizing(false);
  };

  const handleCellSelect = (address: string) => {
    setSelectedCell(address);
    onCellSelect(address);
  };

  const handleCellChange = (address: string, value: string) => {
    const cell = data[address] || {};
    onCellChange(address, value);
  };

  const handleCellBlur = (address: string, value: string, selectedCell: string | null | undefined) => {
    if (value.startsWith('=')) {
      const newValue = evaluateFormula(
        value,
        (addr) => data[addr] || createEmptyCell(),
        selectedCell || undefined
      );
      console.log(`Evaluating formula: ${value} -> ${newValue}`);
      console.log(`Evaluating formula: ${value} -> ${newValue}`);
      onCellChange(address, newValue);
    }
  };

  const cols = Array.from({ length: colCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return (
    <div className="overflow-auto flex-1">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th className="w-10 border bg-gray-100">#</th>
            {cols.map((col, colIndex) => (
              <th key={col} className="border bg-gray-100 relative group">
                <div
                  key={colIndex}
                  className="border-r border-b px-2 py-1 bg-background relative group"
                  style={{ width: colWidths[colIndex] || 100 }}
                >
                  {String.fromCharCode(65 + colIndex)}
                  <div
                    className="absolute right-0 top-0 w-1 h-full cursor-col-resize opacity-0 group-hover:opacity-100 bg-primary/20 hover:bg-primary/40"
                    onMouseDown={(e) => handleResizeStart(e, 'col', colIndex)}
                    onMouseMove={(e) => handleResizeMove(e, 'col', colIndex)}
                    onMouseUp={handleResizeEnd}
                    onMouseLeave={handleResizeEnd}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, row) => (
            <tr key={row}>
              <td className="border bg-gray-100 text-center relative group" style={{height: rowHeights[row] || 30}}>
                <div
                  key={row}
                  className="border-r border-b w-[50px] px-2 py-1 bg-background relative group"
                  style={{ height: rowHeights[row] || 30 }}
                >
                  {row + 1}
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize opacity-0 group-hover:opacity-100 bg-primary/20 hover:bg-primary/40"
                    onMouseDown={(e) => handleResizeStart(e, 'row', row)}
                    onMouseMove={(e) => handleResizeMove(e, 'row', row)}
                    onMouseUp={handleResizeEnd}
                    onMouseLeave={handleResizeEnd}
                  />
                </div>
                {onDeleteRow && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute opacity-0 group-hover:opacity-100 -right-1 top-0"
                    onClick={() => onDeleteRow(row + 1)}
                  >
                    ×
                  </Button>
                )}
              </td>
              {cols.map(col => {
                const address = `${col}${row + 1}`;
                const cell = data[address] || {};
                return (
                  <td
                    key={address}
                    className={`border p-1 ${
                      selectedCell === address ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleCellSelect(address)}
                  >
                    <input
                      className="w-full h-full outline-none bg-transparent"
                      value={cell.formula || cell.value || ""}
                      onChange={(e) => handleCellChange(address, e.target.value)}
                      onBlur={(e) => handleCellBlur(address, e.target.value, selectedCell)}
                      style={{
                        fontWeight: cell.style?.fontWeight,
                        fontStyle: cell.style?.fontStyle,
                        textDecoration: cell.style?.textDecoration,
                        textAlign: cell.style?.textAlign,
                        fontSize: cell.style?.fontSize,
                        color: cell.style?.color,
                        
                      }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
