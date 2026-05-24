const { app } = require('./app');
const { env } = require('./config/env');
const { connectDb } = require('./database/db');
const { seedSuperAdmin, seedDemoData } = require('./database/seed');

let server;

async function start() {
  await connectDb();
  if (env.seedSuperAdmin) {
    await seedSuperAdmin();
  }
  await seedDemoData();

  server = app.listen(env.port, () => {
    console.log(`[server] listening on ${env.port}`);
  });
}

function shutdown(signal) {
  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log(`[server] stopped (${signal})`);
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
