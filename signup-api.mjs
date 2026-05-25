/* global fetch, console */
const url =
  "https://eucjxbcicejyinubzgwh.supabase.co/auth/v1/signup?redirect_to=http%3A%2F%2Flocalhost%3A5173";
const anonKey = "sb_publishable_ON-MWgdQMCFKf7eq0cisXg_zqp3eIok";
const email = `test-${Date.now()}@example.com`;
const password = "Password123!";

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: anonKey,
  },
  body: JSON.stringify({ email, password }),
});

const body = await res.text();
console.log(res.status, body);
