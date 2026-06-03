const { Client } = require('pg');
const client = new Client('postgresql://postgres:12345@localhost:5433/secure_fair_db?schema=public');
client.connect().then(() => {
  return client.query('SELECT * FROM "Student" LIMIT 1');
}).then(r => {
  console.log(r.rows);
  client.end();
}).catch(e => {
  console.error(e);
  client.end();
});
