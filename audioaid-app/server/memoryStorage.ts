import type { HearingTestRecord, InsertHearingTest, InsertProfile, ProfileResponse } from "@shared/schema";
import type { IStorage } from "./storage-types";

export class MemoryStorage implements IStorage {
  private profiles: ProfileResponse[] = [];
  private hearingTests: HearingTestRecord[] = [];
  private nextId = 1;

  constructor() {
    this.profiles.push(
      { id: this.nextId++, name: "Bass Boost", gains: [15, 10, 5, 0, 0, 0] },
      { id: this.nextId++, name: "Treble Boost", gains: [0, 0, 5, 10, 15, 15] },
    );
  }

  async getProfiles(): Promise<ProfileResponse[]> {
    return [...this.profiles];
  }

  async createProfile(profile: InsertProfile): Promise<ProfileResponse> {
    const created = { id: this.nextId++, ...profile };
    this.profiles.push(created);
    return created;
  }

  async deleteProfile(id: number): Promise<void> {
    this.profiles = this.profiles.filter((p) => p.id !== id);
  }

  async listHearingTests(): Promise<HearingTestRecord[]> {
    return [...this.hearingTests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  async createHearingTest(row: InsertHearingTest): Promise<HearingTestRecord> {
    const created: HearingTestRecord = {
      id: crypto.randomUUID(),
      display_name: row.display_name ?? null,
      thresholds: row.thresholds,
      compensation_gains: row.compensation_gains,
      created_at: new Date().toISOString(),
    };
    this.hearingTests.push(created);
    return created;
  }
}