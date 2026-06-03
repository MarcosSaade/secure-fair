const fs = require('fs');
const path = require('path');
const prisma = require('./prismaClient');

async function updateSocioUsers() {
  const content = fs.readFileSync(path.join(__dirname, 'raw_projects.tsv'), 'utf-8');
  // I pasted all the raw data into raw_projects.tsv, let's find the usuarios_organizaciones block
  const lines = content.split('\n').map(l => l.trim());
  let inBlock = false;
  let updated = 0;

  for (const line of lines) {
    if (line === 'usuarios_organizaciones') {
      inBlock = true;
      continue;
    }
    if (inBlock && line === 'organizaciones') {
      break;
    }
    if (inBlock && line && !line.startsWith('id_usuario')) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const userId = parseInt(parts[0], 10);
        const orgId = parseInt(parts[1], 10);
        if (!isNaN(userId) && !isNaN(orgId)) {
          try {
            await prisma.user.update({
              where: { id: userId },
              data: { org_id: orgId }
            });
            updated++;
          } catch (e) {
            console.error(`Could not update user ${userId}:`, e.message);
          }
        }
      }
    }
  }
  console.log(`Updated ${updated} socio users.`);
}

updateSocioUsers().catch(console.error).finally(() => prisma.$disconnect());
