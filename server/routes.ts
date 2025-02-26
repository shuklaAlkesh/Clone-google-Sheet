import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  app.get("/api/spreadsheet", async (req, res) => {
    const spreadsheet = await storage.getSpreadsheet(1);
    res.json(spreadsheet);
  });

  app.post("/api/spreadsheet/cell", async (req, res) => {
    const { address, value } = req.body;
    const spreadsheet = await storage.updateCell(1, address, value);
    res.json(spreadsheet);
  });

  app.post("/api/spreadsheet/dimensions", async (req, res) => {
    const { rowCount, colCount } = req.body;
    const spreadsheet = await storage.updateDimensions(1, { rowCount, colCount });
    res.json(spreadsheet);
  });

  return server;
}