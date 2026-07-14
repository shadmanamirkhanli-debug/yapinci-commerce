// pm2 process definition for the storefront.
//
// script points directly at the `next` binary instead of `npm start`.
// `npm start` wraps the real server in two extra layers (npm -> `sh -c
// "next start"` -> the actual next-server process), and pm2 only signals
// the top of that chain. If the wrapper layers exit before the signal
// reaches the real server, the server survives as an orphan holding the
// port, and pm2 spawns a replacement that immediately fails with
// EADDRINUSE. Execing `next` directly makes pm2's tracked pid the actual
// server process, so a restart's kill signal reaches it with no relay.
module.exports = {
  apps: [
    {
      name: "yapinci",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "15s",
      kill_timeout: 5000,
    },
  ],
};
