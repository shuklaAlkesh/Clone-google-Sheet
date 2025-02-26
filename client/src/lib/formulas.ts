import { Cell } from "@shared/schema";
import { addressToPosition, positionToAddress } from "./spreadsheet";

type FormulaFunction = (cells: Cell[], args?: string[]) => string;

export const formulaFunctions: Record<string, FormulaFunction> = {
  SUM: (cells) => {
    const sum = cells
      .map(cell => parseFloat(cell.value || '0'))
      .filter(val => !isNaN(val))
      .reduce((a, b) => a + b, 0);
    return Number.isInteger(sum) ? sum.toString() : sum.toFixed(2);
  },

  AVERAGE: (cells) => {
    const nums = cells
      .map(cell => parseFloat(cell.value || '0'))
      .filter(val => !isNaN(val));
    if (nums.length === 0) return "0";
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
  },

  MAX: (cells) => {
    const nums = cells
      .map(cell => parseFloat(cell.value || '-Infinity'))
      .filter(val => !isNaN(val));
    if (nums.length === 0) return "0";
    return Math.max(...nums).toString();
  },

  MIN: (cells) => {
    const nums = cells
      .map(cell => parseFloat(cell.value || 'Infinity'))
      .filter(val => !isNaN(val));
    if (nums.length === 0) return "0";
    return Math.min(...nums).toString();
  },

  COUNT: (cells) => {
    return cells
      .filter(cell => cell.value && !isNaN(parseFloat(cell.value)))
      .length.toString();
  },

  TRIM: (cells) => {
    return cells[0]?.value?.trim() || "";
  },

  UPPER: (cells) => {
    return cells[0]?.value?.toUpperCase() || "";
  },

  LOWER: (cells) => {
    return cells[0]?.value?.toLowerCase() || "";
  },

  REMOVE_DUPLICATES: (cells) => {
    const values = cells.map(cell => cell.value);
    const unique = [...new Set(values)];
    return unique.join(",");
  },

  FIND_AND_REPLACE: (cells, args) => {
    if (!args || args.length < 2) return "#ERROR!";
    const [find, replace] = args;
    return cells[0]?.value?.replace(new RegExp(find, 'g'), replace) || "";
  },

  // Data validation functions
  IS_NUMBER: (cells) => {
    const value = cells[0]?.value;
    return (!value || !isNaN(parseFloat(value))).toString();
  },

  IS_DATE: (cells) => {
    const value = cells[0]?.value;
    const date = value ? new Date(value) : null;
    return (!value || !isNaN(date?.getTime() || NaN)).toString();
  }
};

// Export formula information for the helper panel
export const formulaHelpers = {
  SUM: {
    description: "Add up numbers in a range",
    example: "=SUM(A1:A5)",
  },
  AVERAGE: {
    description: "Calculate average of numbers",
    example: "=AVERAGE(B1:B10)",
  },
  MAX: {
    description: "Find highest number in range",
    example: "=MAX(C1:C20)",
  },
  MIN: {
    description: "Find lowest number in range",
    example: "=MIN(D1:D20)",
  },
  COUNT: {
    description: "Count numbers in range",
    example: "=COUNT(E1:E10)",
  },
  TRIM: {
    description: "Remove extra spaces",
    example: "=TRIM(A1)",
  },
  UPPER: {
    description: "Convert to uppercase",
    example: "=UPPER(B1)",
  },
  LOWER: {
    description: "Convert to lowercase",
    example: "=LOWER(C1)",
  },
  REMOVE_DUPLICATES: {
    description: "Remove duplicate values from range",
    example: "=REMOVE_DUPLICATES(A1:A10)",
  },
  FIND_AND_REPLACE: {
    description: "Replace text in a cell",
    example: '=FIND_AND_REPLACE(A1,"find","replace")',
  },
  IS_NUMBER: {
    description: "Check if cell contains a valid number",
    example: "=IS_NUMBER(A1)",
  },
  IS_DATE: {
    description: "Check if cell contains a valid date",
    example: "=IS_DATE(A1)",
  }
};

function parseRange(range: string): string[] {
  const [start, end] = range.split(':').map(ref => ref.trim());
  if (!end) return [start];

  const startPos = addressToPosition(start);
  const endPos = addressToPosition(end);

  const cells: string[] = [];
  for (let row = Math.min(startPos.row, endPos.row); row <= Math.max(startPos.row, endPos.row); row++) {
    for (let col = Math.min(startPos.col, endPos.col); col <= Math.max(startPos.col, endPos.col); col++) {
      cells.push(positionToAddress({ row, col }));
    }
  }

  return cells;
}

function getCellsFromRanges(ranges: string[], getCellValue: (address: string) => Cell): Cell[] {
  const cells: Cell[] = [];
  for (const range of ranges) {
    const addresses = parseRange(range);
    cells.push(...addresses.map(addr => getCellValue(addr)));
  }
  return cells;
}

export function evaluateFormula(formula: string, getCellValue: (address: string) => Cell): string {
  if (!formula.startsWith('=')) return formula;

  try {
    // Handle function calls with arguments
    const match = formula.substring(1).match(/([A-Z_]+)\((.*)\)/);
    if (!match) return "#ERROR!";

    const [_, funcName, argsStr] = match;
    const func = formulaFunctions[funcName];
    if (!func) return "#NAME?";

    // Split arguments handling quoted strings properly
    const args: string[] = [];
    let currentArg = '';
    let inQuotes = false;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '"' && argsStr[i-1] !== '\\') {
        inQuotes = !inQuotes;
        currentArg += char;
      } else if (char === ',' && !inQuotes) {
        args.push(currentArg.trim());
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    args.push(currentArg.trim());

    // For FIND_AND_REPLACE, extract the search and replace terms
    if (funcName === 'FIND_AND_REPLACE') {
      const searchReplace = args.slice(1).map(arg => 
        arg.startsWith('"') && arg.endsWith('"') 
          ? arg.slice(1, -1) 
          : arg
      );
      const ranges = [args[0]];
      const cells = getCellsFromRanges(ranges, getCellValue);
      return func(cells, searchReplace);
    }

    // For other functions, process all arguments as cell ranges
    const cells = getCellsFromRanges(args, getCellValue);
    return func(cells);
  } catch (e) {
    console.error('Formula evaluation error:', e);
    return "#ERROR!";
  }
}