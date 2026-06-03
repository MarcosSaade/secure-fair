require('dotenv').config();
const { Client } = require('pg');

const oldDb = new Client({
  user: 'postgres',
  password: '12345',
  host: 'localhost',
  port: 5433,
  database: 'mi_base_backup_proyectos_2'
});

async function main() {
  await oldDb.connect();
  
  // Get column names of estudiantes table
  const cols = await oldDb.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'estudiantes' 
    ORDER BY ordinal_position
  `);
  console.log('Columnas de tabla ESTUDIANTES:');
  cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  
  // Sample row
  const sample = await oldDb.query('SELECT * FROM estudiantes LIMIT 2');
  console.log('\nEjemplo de fila:');
  console.log(JSON.stringify(sample.rows[0], null, 2));

  await oldDb.end();
}

main().catch(console.error);
