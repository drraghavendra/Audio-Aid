import type { HearingTestRecord, InsertHearingTest, InsertProfile, ProfileResponse } from "@shared/schema";

export interface IStorage {
  getProfiles(): Promise<ProfileResponse[]>;
  createProfile(profile: InsertProfile): Promise<ProfileResponse>;
  deleteProfile(id: number): Promise<void>;
  listHearingTests(): Promise<HearingTestRecord[]>;
  createHearingTest(row: InsertHearingTest): Promise<HearingTestRecord>;
}