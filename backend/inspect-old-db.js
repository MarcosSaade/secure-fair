require('dotenv').config();
const { Client } = require('pg');

const oldDb = new Client({
  user: 'postgres',
  password: '12345',
  host: 'localhost',
  port: 5433,
  database: 'mi_base_backup_proyectos_2'
});

async function inspectOldDb() {
  await oldDb.connect();
  console.log('=== ESTRUCTURA DE LA ANTIGUA DB ===\n');

  // All tables
  const tables = await oldDb.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  console.log('TABLAS:', tables.rows.map(r => r.table_name).join(', '), '\n');

  // Columns of each table + sample row + count
  for (const { table_name } of tables.rows) {
    const cols = await oldDb.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = $1 ORDER BY ordinal_position
    `, [table_name]);
    const count = await oldDb.query(`SELECT COUNT(*) FROM "${table_name}"`);
    console.log(`--- ${table_name.toUpperCase()} (${count.rows[0].count} filas) ---`);
    console.log('  Columnas:', cols.rows.map(c => `${c.column_name}(${c.data_type})`).join(', '));
    
    const sample = await oldDb.query(`SELECT * FROM "${table_name}" LIMIT 1`);
    if (sample.rows.length > 0) {
      console.log('  Ejemplo:', JSON.stringify(sample.rows[0]));
    }
    console.log();
  }

  await oldDb.end();
}

inspectOldDb().catch(console.error);
