// Promotes an existing account to admin.
// Usage: npm run make-admin -- someone@example.com
// (The account must have already signed up on the site at least once.)

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make-admin -- someone@example.com");
  process.exit(1);
}

const { data, error } = await supabase
  .from("profiles")
  .update({ is_admin: true })
  .eq("email", email)
  .select("id, email, is_admin")
  .single();

if (error) {
  console.error(`Failed to promote ${email}:`, error.message);
  console.error("Make sure they've signed up on the site at least once first.");
  process.exit(1);
}

console.log("Promoted to admin:", data);
