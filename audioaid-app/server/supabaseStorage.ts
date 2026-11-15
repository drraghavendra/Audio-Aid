import type { HearingTestRecord, InsertHearingTest, InsertProfile, ProfileResponse } from "@shared/schema";
import type { IStorage } from "./storage-types";
import { getSupabase } from "./supabase";

export class SupabaseStorage implements IStorage {
  async getProfiles(): Promise<ProfileResponse[]> {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb.from("eq_profiles").select("*").order("id");
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: Number(row.id),
      name: row.name,
      gains: row.gains as number[],
    }));
  }

  async createProfile(profile: InsertProfile): Promise<ProfileResponse> {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("eq_profiles")
      .insert({ name: profile.name, gains: profile.gains })
      .select()
      .single();
    if (error) throw error;
    return { id: Number(data.id), name: data.name, gains: data.gains as number[] };
  }

  async deleteProfile(id: number): Promise<void> {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase not configured");
    const { error } = await sb.from("eq_profiles").delete().eq("id", id);
    if (error) throw error;
  }

  async listHearingTests(): Promise<HearingTestRecord[]> {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("hearing_tests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as HearingTestRecord[];
  }

  async createHearingTest(row: InsertHearingTest): Promise<HearingTestRecord> {
    const sb = getSupabase();
    if (!sb) throw new Error("Supabase not configured");
    const { data, error } = await sb
      .from("hearing_tests")
      .insert({
        display_name: row.display_name ?? null,
        thresholds: row.thresholds,
        compensation_gains: row.compensation_gains,
      })
      .select()
      .single();
    if (error) throw error;
    return data as HearingTestRecord;
  }
}