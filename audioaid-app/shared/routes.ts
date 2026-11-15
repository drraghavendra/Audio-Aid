import { z } from "zod";
import { insertHearingTestSchema, insertProfileSchema, eqProfiles } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  profiles: {
    list: {
      method: "GET" as const,
      path: "/api/profiles" as const,
      responses: {
        200: z.array(z.custom<typeof eqProfiles.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/profiles" as const,
      input: insertProfileSchema,
      responses: {
        201: z.custom<typeof eqProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/profiles/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  hearingTests: {
    list: {
      method: "GET" as const,
      path: "/api/hearing-tests" as const,
    },
    create: {
      method: "POST" as const,
      path: "/api/hearing-tests" as const,
      input: insertHearingTestSchema,
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}