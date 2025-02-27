import { Cell, CellStyle } from "@shared/schema";

export type CellPosition = {
  row: number;
  col: number;
};

export type CellAddress = string; // A1, B2, $A$1, etc.

export function positionToAddress(pos: CellPosition, absolute: { row?: boolean; col?: boolean } = {}): CellAddress {
  const colLetter = String.fromCharCode(65 + pos.col);
  return `${absolute.col ? '$' : ''}${colLetter}${absolute.row ? '$' : ''}${pos.row + 1}`;
}

export function addressToPosition(address: CellAddress): CellPosition {
  // Remove $ signs for absolute references
  const cleanAddress = address.replace(/\$/g, '');
  const col = cleanAddress.match(/[A-Z]+/)?.[0];
  const row = cleanAddress.match(/\d+/)?.[0];

  if (!col || !row) throw new Error("Invalid cell address");

  return {
    col: col.charCodeAt(0) - 65,
    row: parseInt(row) - 1
  };
}

export function isAbsoluteReference(address: string): { row: boolean; col: boolean } {
  return {
    col: address.startsWith('$'),
    row: address.includes('$', 1)
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
