import { evaluateFormula } from './formulas';
import { Cell } from '@shared/schema';

// Mock getCellValue function
function getCellValue(address: string): Cell {
  const mockData: Record<string, Cell> = {
    'A1': { value: '10' },
    'A2': { value: '20' },
    'A3': { value: '30' },
    'B1': { value: '5' },
    'B2': { value: '15' },
    'B3': { value: '25' },
  };
  return mockData[address] || { value: '' };
}

// Test cases
const testCases = [
  { formula: '=SUM(A1:A3)', expected: '60' },
  { formula: '=AVERAGE(A1:A3)', expected: '20.00' },
  { formula: '=MAX(A1:A3)', expected: '30' },
  { formula: '=MIN(A1:A3)', expected: '10' },
  { formula: '=COUNT(A1:A3)', expected: '3' },
  { formula: '=TRIM(A1)', expected: '10' },
  { formula: '=UPPER(A1)', expected: '10' },
  { formula: '=LOWER(A1)', expected: '10' },
  { formula: '=REMOVE_DUPLICATES(A1:A3)', expected: '10,20,30' },
  { formula: '=FIND_AND_REPLACE(A1,"10","100")', expected: '100' },
  { formula: '=IS_NUMBER(A1)', expected: 'true' },
  { formula: '=IS_DATE(A1)', expected: 'false' },
  { formula: '=CHART("line","A1:A3")', expected: '__CHART__line__A1:A3' },
  { formula: '=COPY_ABSOLUTE($A$1)', expected: '10' },
  { formula: '=SUMIF(A1:A3,">15")', expected: '50' },
  { formula: '=COUNTIF(A1:A3,">15")', expected: '2' },
  { formula: '=CONCATENATE(A1:A3)', expected: '102030' },
];

// Run test cases
testCases.forEach(({ formula, expected }) => {
  const result = evaluateFormula(formula, getCellValue);
  console.log(`Formula: ${formula}, Expected: ${expected}, Result: ${result}`);
});
