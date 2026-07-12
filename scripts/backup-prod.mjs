// Full local backup of PRODUCTION: every table row + every storage photo.
// Reads prod creds from .env.prod.local. Writes to backups/<timestamp>/.
//
//   node scripts/backup-prod.mjs
//
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnv(path) {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]])
  );
}

const env = parseEnv(".env.prod.local");
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = `backups/${stamp}`;
mkdirSync(`${dir}/photos`, { recursive: true });
console.log(`Backing up ${env.NEXT_PUBLIC_SUPABASE_URL}\n→ ${dir}\n`);

// 1. Tables → JSON
const manifest = { source: env.NEXT_PUBLIC_SUPABASE_URL, created: stamp, tables: {}, photos: {} };
for (const table of ["submissions", "events", "opportunities"]) {
  const { data, error } = await sb.from(table).select("*");
  if (error) throw new Error(`${table}: ${error.message}`);
  writeFileSync(`${dir}/${table}.json`, JSON.stringify(data, null, 2));
  manifest.tables[table] = data.length;
  console.log(`✓ ${table}: ${data.length} rows`);
}

// 2. Storage photos → files
let objects = [], offset = 0;
while (true) {
  const { data, error } = await sb.storage
    .from("service-photos")
    .list("", { limit: 1000, offset });
  if (error) throw new Error(`list: ${error.message}`);
  objects = objects.concat(data);
  if (data.length < 1000) break;
  offset += 1000;
}
const files = objects.filter((o) => o.id); // folders have null id
let ok = 0, failed = 0;
for (const f of files) {
  const { data, error } = await sb.storage.from("service-photos").download(f.name);
  if (error) {
    console.error(`✗ photo ${f.name}: ${error.message}`);
    failed++;
    continue;
  }
  const buf = Buffer.from(await data.arrayBuffer());
  writeFileSync(`${dir}/photos/${f.name}`, buf);
  ok++;
}
manifest.photos = { downloaded: ok, failed, total: files.length };
console.log(`✓ photos: ${ok}/${files.length} downloaded${failed ? ` (${failed} failed)` : ""}`);

writeFileSync(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`\nDone. Backup at ${dir}`);
