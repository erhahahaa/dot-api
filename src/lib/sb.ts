import { createClient } from "@supabase/supabase-js";

const SB_URL = process.env.SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export const sb = createClient(SB_URL, SB_KEY);
