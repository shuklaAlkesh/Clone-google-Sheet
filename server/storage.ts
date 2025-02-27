import { Spreadsheet, InsertSpreadsheet, Cell } from "@shared/schema";
import { getDefaultGrid } from "../client/src/lib/spreadsheet";

export interface IStorage {
  getSpreadsheet(id: number): Promise<Spreadsheet>;
  getAllSpreadsheets(): Promise<Spreadsheet[]>;
  createSpreadsheet(name: string): Promise<Spreadsheet>;
  updateCell(id: number, address: string, value: string): Promise<Spreadsheet>;
  updateDimensions(id: number, dimensions: { rowCount?: number; colCount?: number }): Promise<Spreadsheet>;
}

export class MemStorage implements IStorage {
  private spreadsheets: Map<number, Spreadsheet>;
  private nextId: number;

  constructor() {
    this.spreadsheets = new Map();
    this.nextId = 1;
    // Initialize with default spreadsheet
    this.createSpreadsheet("Untitled Spreadsheet");
  }

  async getAllSpreadsheets(): Promise<Spreadsheet[]> {
    return Array.from(this.spreadsheets.values());
  }

  async createSpreadsheet(name: string): Promise<Spreadsheet> {
    const spreadsheet: Spreadsheet = {
      id: this.nextId++,
      name,
      data: getDefaultGrid(100, 26),
      rowCount: 100,
      colCount: 26
    };
    this.spreadsheets.set(spreadsheet.id, spreadsheet);
    return spreadsheet;
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
    return spreadsheet;
  }

  async deleteRow(id: number, rowIndex: number): Promise<Spreadsheet> {
    const spreadsheet = await this.getSpreadsheet(id);
    const newData: Record<string, Cell> = {};
    
    // Copy cells, shifting rows up after the deleted row
    Object.entries(spreadsheet.data).forEach(([addr, cell]) => {
      const [col, row] = addr.match(/([A-Z]+)(\d+)/)?.slice(1) || [];
      const currentRow = parseInt(row);
      
      if (currentRow < rowIndex) {
        newData[addr] = cell;
      } else if (currentRow > rowIndex) {
        newData[`${col}${currentRow - 1}`] = cell;
      }
    });

    const updated = {
      ...spreadsheet,
      data: newData,
      rowCount: spreadsheet.rowCount - 1
    };
    
    this.spreadsheets.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();