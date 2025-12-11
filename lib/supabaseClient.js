import { createClient } from "@supabase/supabase-js";

// Accept several env var names to support server vs client deployments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SUPABASE_ANON_KEY;

let _supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // During build or in some environments the env may not be available at import time.
  // Export a stub that throws when actually used so import-time doesn't fail.
  const handler = {
    get() {
      throw new Error(
        "Supabase client not initialized: missing SUPABASE URL/KEY in environment.\n" +
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL/SUPABASE_ANON_KEY)"
      );
    },
  };

  // Create a proxy that will throw if any property is accessed
  _supabase = new Proxy({}, handler);
}

export const supabase = _supabase;
