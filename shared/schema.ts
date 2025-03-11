import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  sourceLanguage: text("source_language").notNull().default("hi"), // Default to Hindi
  english: text("english").notNull(),
  tamil: text("tamil"),
  telugu: text("telugu"),
  malayalam: text("malayalam"),
  pitman: text("pitman"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).pick({
  sourceText: true,
  sourceLanguage: true,
  english: true,
  tamil: true,
  telugu: true,
  malayalam: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;
