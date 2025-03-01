import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTranslationSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/translate", async (req, res) => {
    try {
      const { text } = req.body;

      // Here you would integrate with a translation API
      // For demo purposes, we'll return mock translations
      const translations = {
        hindi: text,
        english: `English translation of: ${text}`,
        tamil: `Tamil translation of: ${text}`,
      };

      const validatedData = insertTranslationSchema.parse(translations);
      await storage.createTranslation(validatedData);

      res.json(translations);
    } catch (error) {
      res.status(500).json({ message: "Translation failed" });
    }
  });

  return createServer(app);
}
