import { useSupabase } from "./supabase";
import { MemoryStorage } from "./memoryStorage";
import { SupabaseStorage } from "./supabaseStorage";

export type { IStorage } from "./storage-types";

export const storage = useSupabase() ? new SupabaseStorage() : new MemoryStorage();

if (useSupabase()) {
  console.log("[storage] Using Supabase");
} else {
  console.log("[storage] Using in-memory store (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to persist)");
}