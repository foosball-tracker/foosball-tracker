# Supabase Local Development

Use the local Supabase stack by default for development, tests, and proof capture.

## Remote SSH Ports

When the app is opened from VS Code Remote SSH on Windows, the browser still runs on Windows. In that setup, `127.0.0.1` in the app means Windows localhost, not the remote Linux host.

Windows reserved TCP ports `54265-54364` on this machine, which blocked SSH and VS Code from binding the default Supabase ports `54321-54324`. To avoid that conflict, this repo uses:

- `127.0.0.1:15421` for Supabase API/Auth
- `127.0.0.1:15422` for Postgres
- `127.0.0.1:15423` for Supabase Studio
- `127.0.0.1:15424` for Mailpit
- `127.0.0.1:5173` for Vite

Use same-port forwarding from Windows to `dockerhost`:

```sshconfig
Host dockerhost
  HostName dockerhost
  User josh
  LocalForward 127.0.0.1:15421 127.0.0.1:15421
  LocalForward 127.0.0.1:15422 127.0.0.1:15422
  LocalForward 127.0.0.1:15423 127.0.0.1:15423
  LocalForward 127.0.0.1:15424 127.0.0.1:15424
```

Validate the Windows side before debugging app code:

```powershell
curl.exe http://127.0.0.1:15421/auth/v1/health
curl.exe -I http://127.0.0.1:15423/
curl.exe http://127.0.0.1:5173/
netstat -ano | findstr ":15421"
netstat -ano | findstr ":15423"
netstat -ano | findstr ":5173"
```

`pnpm local:dev` uses the local Supabase stack on these ports. `pnpm local:hosted` keeps the browser local but points the app at the hosted Supabase project from `.env`.
