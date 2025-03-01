import { translations, type Translation, type InsertTranslation } from "@shared/schema";

export interface IStorage {
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getTranslation(id: number): Promise<Translation | undefined>;
}

export class MemStorage implements IStorage {
  private translations: Map<number, Translation>;
  private currentId: number;

  constructor() {
    this.translations = new Map();
    this.currentId = 1;
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const id = this.currentId++;
    const newTranslation: Translation = {
      ...translation,
      id,
      createdAt: new Date(),
    };
    this.translations.set(id, newTranslation);
    return newTranslation;
  }

  async getTranslation(id: number): Promise<Translation | undefined> {
    return this.translations.get(id);
  }
}

export const storage = new MemStorage();
