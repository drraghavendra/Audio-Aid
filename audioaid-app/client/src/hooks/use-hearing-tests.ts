import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertHearingTest } from "@shared/schema";

export function useHearingTests() {
  return useQuery({
    queryKey: [api.hearingTests.list.path],
    queryFn: async () => {
      const res = await fetch(api.hearingTests.list.path);
      if (!res.ok) throw new Error("Failed to fetch hearing tests");
      return res.json();
    },
  });
}

export function useCreateHearingTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHearingTest) => {
      const res = await fetch(api.hearingTests.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.hearingTests.list.path] }),
  });
}