const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 AS ok');
    console.log('prisma-ok', res.rows);
    await client.end();
    process.exit(0);
  } catch (e) {
    console.error(e);
    try { await client.end(); } catch (e2) {}
    process.exit(3);
  }
})();
