// One-off: copy production ROW DATA into the local Supabase instance.
// Reads prod creds from .env.prod.local and local creds from .env.local.
// Storage photo files are NOT copied (only the photo_paths rows) — acceptable for dev.
//
//   node scripts/pull-prod-data.mjs
//
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnv(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const prodEnv = parseEnv(".env.prod.local");
const localEnv = parseEnv(".env.local");

const prod = createClient(
  prodEnv.NEXT_PUBLIC_SUPABASE_URL,
  prodEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const local = createClient(
  localEnv.NEXT_PUBLIC_SUPABASE_URL,
  localEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TABLES = ["submissions", "events", "opportunities"];

for (const table of TABLES) {
  const { data, error } = await prod.from(table).select("*");
  if (error) {
    console.error(`✗ ${table}: read from prod failed — ${error.message}`);
    continue;
  }
  if (!data || data.length === 0) {
    console.log(`• ${table}: 0 rows in prod, nothing to copy`);
    continue;
  }
  const { error: upErr } = await local.from(table).upsert(data, { onConflict: "id" });
  if (upErr) {
    console.error(`✗ ${table}: insert into local failed — ${upErr.message}`);
    continue;
  }
  console.log(`✓ ${table}: copied ${data.length} rows → local`);
}

console.log("Done.");
