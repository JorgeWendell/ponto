import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://ponto.adelbr.tech",
    "http://ponto.adelbr.tech:3000",
    "http://192.168.15.55:3000",
    "http://192.168.15.12:3000",
    "https://192.168.15.12:3000",
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
