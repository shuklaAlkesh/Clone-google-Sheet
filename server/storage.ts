import { Spreadsheet, InsertSpreadsheet, Cell } from "@shared/schema";
import { getDefaultGrid } from "../client/src/lib/spreadsheet";

export interface IStorage {
  getSpreadsheet(id: number): Promise<Spreadsheet>;
  updateCell(id: number, address: string, value: string): Promise<Spreadsheet>;
  updateDimensions(id: number, dimensions: { rowCount?: number; colCount?: number }): Promise<Spreadsheet>;
}

export class MemStorage implements IStorage {
  private spreadsheets: Map<number, Spreadsheet>;

  constructor() {
    this.spreadsheets = new Map();
    // Initialize with default spreadsheet
    this.spreadsheets.set(1, {
      id: 1,
      name: "Untitled Spreadsheet",
      data: getDefaultGrid(100, 26),
      rowCount: 100,
      colCount: 26
    });
  }

  async getSpreadsheet(id: number): Promise<Spreadsheet> {
    const spreadsheet = this.spreadsheets.get(id);
    if (!spreadsheet) throw new Error("Spreadsheet not found");
    return spreadsheet;
  }

  async updateCell(id: number, address: string, value: string): Promise<Spreadsheet> {
    const spreadsheet = await this.getSpreadsheet(id);

    const newData = { ...spreadsheet.data };
    newData[address] = {
      ...newData[address],
      value,
      formula: value.startsWith('=') ? value : undefined
    };

    const updated = { ...spreadsheet, data: newData };
    this.spreadsheets.set(id, updated);

    return updated;
  }

  async updateDimensions(id: number, dimensions: { rowCount?: number; colCount?: number }): Promise<Spreadsheet> {
    const spreadsheet = await this.getSpreadsheet(id);

    const updated = {
      ...spreadsheet,
      rowCount: dimensions.rowCount ?? spreadsheet.rowCount,
      colCount: dimensions.colCount ?? spreadsheet.colCount,
      data: {
        ...spreadsheet.data,
        ...getDefaultGrid(
          dimensions.rowCount ?? spreadsheet.rowCount,
          dimensions.colCount ?? spreadsheet.colCount
        )
      }
    };

    this.spreadsheets.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();