import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  const existingProfiles = await storage.getProfiles();
  if (existingProfiles.length === 0) {
    await storage.createProfile({
      name: "Bass Boost",
      gains: [15, 10, 5, 0, 0, 0],
    });
    await storage.createProfile({
      name: "Treble Boost",
      gains: [0, 0, 5, 10, 15, 15],
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, storage: process.env.SUPABASE_URL ? "supabase" : "memory" });
  });

  app.get(api.profiles.list.path, async (_req, res) => {
    try {
      const profiles = await storage.getProfiles();
      res.json(profiles);
    } catch {
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.post(api.profiles.create.path, async (req, res) => {
    try {
      const input = api.profiles.create.input.parse(req.body);
      const profile = await storage.createProfile(input);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.delete(api.profiles.delete.path, async (req, res) => {
    try {
      await storage.deleteProfile(Number(req.params.id));
      res.status(204).end();
    } catch {
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  app.get(api.hearingTests.list.path, async (_req, res) => {
    try {
      res.json(await storage.listHearingTests());
    } catch {
      res.status(500).json({ message: "Failed to list hearing tests" });
    }
  });

  app.post(api.hearingTests.create.path, async (req, res) => {
    try {
      const input = api.hearingTests.create.input.parse(req.body);
      const row = await storage.createHearingTest(input);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to save hearing test" });
    }
  });

  return httpServer;
}