import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cellStyle = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textDecoration: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
});

export type CellStyle = z.infer<typeof cellStyle>;

export const cell = z.object({
  value: z.string().optional(),
  formula: z.string().optional(),
  style: cellStyle.optional(),
});

export type Cell = z.infer<typeof cell>;

export const spreadsheets = pgTable("spreadsheets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: jsonb("data").$type<Record<string, Cell>>().notNull(),
  rowCount: integer("row_count").notNull().default(100),
  colCount: integer("col_count").notNull().default(26),
});

export const insertSpreadsheetSchema = createInsertSchema(spreadsheets).pick({
  name: true,
  data: true,
  rowCount: true,
  colCount: true,
});

export type InsertSpreadsheet = z.infer<typeof insertSpreadsheetSchema>;
export type Spreadsheet = typeof spreadsheets.$inferSelect;
