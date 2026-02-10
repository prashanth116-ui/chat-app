import { pool } from '../config/database.js';
import { COUNTRIES, STATES_BY_COUNTRY } from '@chat-app/shared';

async function seed() {
  console.log('Seeding database...');

  // Insert countries
  for (const country of COUNTRIES) {
    await pool.query(
      `INSERT INTO countries (name, code, flag_emoji)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO NOTHING`,
      [country.name, country.code, country.flagEmoji]
    );
  }
  console.log(`Inserted ${COUNTRIES.length} countries`);

  // Insert states for countries that have them
  for (const [countryCode, states] of Object.entries(STATES_BY_COUNTRY)) {
    // Get country ID
    const countryResult = await pool.query<{ id: number }>(
      'SELECT id FROM countries WHERE code = $1',
      [countryCode]
    );

    if (countryResult.rows.length === 0) continue;

    const countryId = countryResult.rows[0].id;

    for (const state of states) {
      await pool.query(
        `INSERT INTO states (country_id, name, code)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [countryId, state.name, state.code]
      );
    }
    console.log(`Inserted ${states.length} states for ${countryCode}`);
  }

  // Create some default public rooms
  const defaultRooms = [
    { name: 'General Chat', description: 'A place for general discussion' },
    { name: 'Music', description: 'Share and discuss your favorite music' },
    { name: 'Gaming', description: 'Talk about video games, board games, and more' },
    { name: 'Movies & TV', description: 'Discuss the latest shows and movies' },
    { name: 'Sports', description: 'Sports news and discussions' },
    { name: 'Tech', description: 'Technology news and help' },
  ];

  for (const room of defaultRooms) {
    await pool.query(
      `INSERT INTO rooms (name, description, is_private)
       VALUES ($1, $2, false)
       ON CONFLICT DO NOTHING`,
      [room.name, room.description]
    );
  }
  console.log(`Created ${defaultRooms.length} default rooms`);

  console.log('Seeding complete!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
