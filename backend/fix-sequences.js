const { Client } = require('pg');

async function fixSequences() {
  const client = new Client('postgresql://postgres:12345@localhost:5433/secure_fair_db?schema=public');
  await client.connect();

  const tables = [
    'User',
    'FairPeriod',
    'Project',
    'Organization',
    'Enrollment',
    'TimeSlot',
    'ProjectCode'
  ];

  try {
    for (const table of tables) {
      console.log(`Fixing sequence for ${table}...`);
      // Find max ID
      const maxRes = await client.query(`SELECT MAX(id) FROM "${table}"`);
      const maxId = maxRes.rows[0].max || 0;
      
      // Update sequence
      if (maxId > 0) {
        await client.query(`SELECT setval('"${table}_id_seq"', ${maxId})`);
        console.log(`  Set sequence to ${maxId}`);
      }
    }
    console.log('✅ All sequences fixed!');
  } catch (err) {
    console.error('Error fixing sequences:', err);
  } finally {
    await client.end();
  }
}

fixSequences();
