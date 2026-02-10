import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, 'migrations');

async function migrate() {
  console.log('Running migrations...');

  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Get executed migrations
  const result = await pool.query<{ name: string }>('SELECT name FROM migrations ORDER BY id');
  const executed = new Set(result.rows.map((r) => r.name));

  // Get migration files
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`Skipping ${file} (already executed)`);
      continue;
    }

    console.log(`Running ${file}...`);
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');

    try {
      await pool.query(sql);
      await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      console.log(`Completed ${file}`);
    } catch (error) {
      console.error(`Error running ${file}:`, error);
      throw error;
    }
  }

  console.log('Migrations complete!');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
