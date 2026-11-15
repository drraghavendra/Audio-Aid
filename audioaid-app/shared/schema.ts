import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const FREQUENCIES_HZ = [250, 500, 1000, 2000, 4000, 8000] as const;

export const eqProfiles = pgTable("eq_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gains: jsonb("gains").notNull().$type<number[]>(),
});

export const insertProfileSchema = createInsertSchema(eqProfiles, {
  gains: z.array(z.number()).length(6),
}).omit({ id: true });

export type EqProfile = typeof eqProfiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type ProfileResponse = EqProfile;

const sixNumbers = z.array(z.number()).length(6);

export const insertHearingTestSchema = z.object({
  display_name: z.string().optional(),
  thresholds: sixNumbers,
  compensation_gains: sixNumbers,
});

export type InsertHearingTest = z.infer<typeof insertHearingTestSchema>;

export type HearingTestRecord = {
  id: string;
  display_name: string | null;
  thresholds: number[];
  compensation_gains: number[];
  created_at: string;
};