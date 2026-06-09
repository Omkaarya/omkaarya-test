import pg from 'pg';
const { Client } = pg;

const configs = [
  { user: 'postgres', password: '', database: 'postgres' },
  { user: 'postgres', password: 'postgres', database: 'postgres' },
  { user: 'postgres', password: 'password', database: 'postgres' },
  { user: 'postgres', password: 'admin', database: 'postgres' },
  { user: process.env.USER || 'klsharma', password: '', database: 'postgres' },
  { user: 'postgres', password: 'Inthumathi10*', database: 'postgres' }
];

async function test() {
  for (const config of configs) {
    console.log(`Testing config: user=${config.user}, password=${config.password ? '***' : '(empty)'}`);
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: config.user,
      password: config.password,
      database: config.database
    });
    try {
      await client.connect();
      console.log(` SUCCESS! Connected to database.`);
      const res = await client.query('SELECT current_user, current_database()');
      console.log(`  Query result:`, res.rows[0]);
      await client.end();
      return;
    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
    }
  }
  console.log("None of the standard local configurations worked.");
}

test();
