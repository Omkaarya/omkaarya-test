const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/omkaarya'
});

async function audit() {
  const tables = [
    'tenants',
    'users',
    'pricing_plans',
    'feature_registry',
    'plan_features',
    'inv_categories',
    'inv_products',
    'fin_transactions',
    'fin_donations'
  ];

  console.log('--- DATABASE AUDIT ---');
  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`[OK] Table: ${table.padEnd(20)} | Count: ${res.rows[0].count}`);
    } catch (err) {
      console.log(`[FAIL] Table: ${table.padEnd(18)} | Error: ${err.stack}`);
    }
  }

  // Check feature registry module keys
  try {
    const res = await pool.query(`SELECT module_key, COUNT(*) FROM feature_registry GROUP BY module_key`);
    console.log('\n--- MODULE KEY DISTRIBUTION ---');
    res.rows.forEach(row => {
      console.log(`${row.module_key.padEnd(15)}: ${row.count}`);
    });
  } catch (err) {
    console.log('Failed to check module distribution');
  }

  pool.end();
}

audit();
