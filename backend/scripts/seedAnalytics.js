require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function main() {
  const sqlPath = path.join(__dirname, '..', 'src', 'db', 'mock_analytics.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await pool.query(sql);
  console.log('Analytics mock data seeded successfully.');
}

main()
  .catch((error) => {
    console.error('Analytics mock data seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
