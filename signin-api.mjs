/* global fetch, console */
const url = "https://eucjxbcicejyinubzgwh.supabase.co/auth/v1/token?grant_type=password";
const anonKey = "sb_publishable_ON-MWgdQMCFKf7eq0cisXg_zqp3eIok";
const email = "testuser1779722408604@gmail.com";
const password = "Password123!"; // NOSONAR -- dev helper script, test credential

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: anonKey,
  },
  body: JSON.stringify({ email, password }),
});
await res.text();
console.log(res.status); // NOSONAR -- dev helper script, intentionally logs status
