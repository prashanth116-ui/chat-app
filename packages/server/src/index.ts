import { createServer } from 'http';
import app from './app.js';
import { setupSocketIO } from './socket/index.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';
import { redis } from './config/redis.js';

const httpServer = createServer(app);

// Setup Socket.IO
const io = setupSocketIO(httpServer);

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully...');

  io.close();
  await pool.end();
  await redis.quit();

  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
