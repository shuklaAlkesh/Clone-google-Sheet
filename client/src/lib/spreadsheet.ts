import { Cell, CellStyle } from "@shared/schema";

export type CellPosition = {
  row: number;
  col: number;
};

export type CellAddress = string; // A1, B2, etc.

export function positionToAddress(pos: CellPosition): CellAddress {
  const colLetter = String.fromCharCode(65 + pos.col);
  return `${colLetter}${pos.row + 1}`;
}

export function addressToPosition(address: CellAddress): CellPosition {
  const col = address.match(/[A-Z]+/)?.[0];
  const row = address.match(/\d+/)?.[0];
  
  if (!col || !row) throw new Error("Invalid cell address");
  
  return {
    col: col.charCodeAt(0) - 65,
    row: parseInt(row) - 1
  };
}

export function createEmptyCell(): Cell {
  return {
    value: "",
    style: {}
  };
}

export function getDefaultGrid(rows: number, cols: number): Record<string, Cell> {
  const grid: Record<string, Cell> = {};
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const address = positionToAddress({ row, col });
      grid[address] = createEmptyCell();
    }
  }
  
  return grid;
}

export function updateCellStyle(cell: Cell, style: Partial<CellStyle>): Cell {
  return {
    ...cell,
    style: {
      ...cell.style,
      ...style
    }
  };
}
