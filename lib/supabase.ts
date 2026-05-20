import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getBrowserClient(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey);
}

export function getServiceClient(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const PHOTOS_BUCKET = "service-photos";

export type Submission = {
  id: string;
  created_at: string;
  unit: string;
  name: string | null;
  hours: number;
  project: string;
  story: string | null;
  photo_paths: string[];
};

export type ServiceEvent = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  unit: string | null;
};

export type ServiceOpportunity = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  contact_name: string | null;
  contact_info: string | null;
  availability: string | null;
  location: string | null;
};
