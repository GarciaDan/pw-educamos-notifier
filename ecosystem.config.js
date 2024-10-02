module.exports = {
  apps: [
    {
      name: "pw-educamos-notifier",
      script: "npm",
      args: "run once",
      watch: false,
      autorestart: false,
      cron_restart: "*/30 * * * *",
    },
  ],
};
