import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  app.get("/api/spreadsheets", async (req, res) => {
    const spreadsheets = await storage.getAllSpreadsheets();
    res.json(spreadsheets);
  });

  app.post("/api/spreadsheets", async (req, res) => {
    const { name } = req.body;
    const spreadsheet = await storage.createSpreadsheet(name || "Untitled Spreadsheet");
    res.json(spreadsheet);
  });

  app.get("/api/spreadsheet/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const spreadsheet = await storage.getSpreadsheet(id);
    res.json(spreadsheet);
  });

  app.post("/api/spreadsheet/:id/cell", async (req, res) => {
    const id = parseInt(req.params.id);
    const { address, value } = req.body;
    const spreadsheet = await storage.updateCell(id, address, value);
    res.json(spreadsheet);
  });

  app.delete("/api/spreadsheet/:id/row/:rowIndex", async (req, res) => {
    const id = parseInt(req.params.id);
    const rowIndex = parseInt(req.params.rowIndex);
    const spreadsheet = await storage.deleteRow(id, rowIndex);
    res.json(spreadsheet);
  });

  return server;
}