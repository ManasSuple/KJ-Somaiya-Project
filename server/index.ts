import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Admin: list Supabase auth users (requires SUPABASE_SERVICE_ROLE_KEY)
  app.get("/api/admin/users", async (_req, res) => {
    try {
      // Allow fallback to VITE_SUPABASE_URL for convenience, but NEVER for service role key
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ error: "Server is not configured with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY" });
      }

      const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      const users = (data?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: (u as any).last_sign_in_at ?? null,
      }));
      return res.json({ users });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Unexpected error" });
    }
  });

  // Note: removed demo route

  return app;
}
