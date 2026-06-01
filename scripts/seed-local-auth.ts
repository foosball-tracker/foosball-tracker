import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl?.includes("127.0.0.1") && !supabaseUrl?.includes("localhost")) {
  console.error("Error: Refusing to seed auth users outside local Supabase.");
  console.error(`  SUPABASE_URL="${supabaseUrl ?? "(not set)"}"`);
  console.error("  Expected http://127.0.0.1:54321 or http://localhost:54321");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("Error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  console.error(
    "  Run `pnpm supabase:status` and set SUPABASE_SERVICE_ROLE_KEY to the service_role key."
  );
  process.exit(1);
}

console.log(`Seeding local auth users on ${supabaseUrl} ...`);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedUser {
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

const users: SeedUser[] = [
  {
    email: "admin@example.local",
    password: "password123",
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    is_admin: true,
  },
  {
    email: "player1@example.local",
    password: "password123",
    role: "player",
    first_name: "Player",
    last_name: "One",
    is_admin: false,
  },
  {
    email: "player2@example.local",
    password: "password123",
    role: "player",
    first_name: "Player",
    last_name: "Two",
    is_admin: false,
  },
  {
    email: "viewer@example.local",
    password: "password123",
    role: "viewer",
    first_name: "Viewer",
    last_name: "User",
    is_admin: false,
  },
];

let created = 0;
let skipped = 0;

for (const user of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { local_test_user: true, role: user.role },
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("taken") ||
      error.message.toLowerCase().includes("duplicate") ||
      error.message.toLowerCase().includes("exists")
    ) {
      console.log(`  ${user.email} — already exists, skipping.`);
      skipped++;
    } else {
      console.error(`  ${user.email} — error:`, error.message);
      throw error;
    }
  }

  if (data?.user) {
    console.log(`  ${user.email} — created (id: ${data.user.id}).`);
    created++;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: data.user.id,
        is_admin: user.is_admin,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      console.error(`  ${user.email} — profile upsert error:`, profileError.message);
    } else {
      console.log(`  ${user.email} — profile upserted.`);
    }
  }
}

console.log();
console.log(`Done. Created ${created}, skipped ${skipped} (already existed).`);
console.log();
console.log("Local test credentials:");
for (const user of users) {
  console.log(`  ${user.email} / ${user.password}  (${user.is_admin ? "admin" : "user"})`);
}
