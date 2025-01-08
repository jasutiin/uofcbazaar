import { createClient } from "@supabase/supabase-js";

const db = createClient(
  Deno.env.get("VITE_SUPABASE_URL")!,
  Deno.env.get("VITE_SUPABASE_KEY")!,
);

export default db;
