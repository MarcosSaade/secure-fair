const fs = require('fs');
const path = require('path');
const prisma = require('./prismaClient');

async function processData() {
  const content = fs.readFileSync(path.join(__dirname, 'raw_projects.tsv'), 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);

  let updated = 0;
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 8) {
      const id = parseInt(parts[0], 10);
      const duracion = parts[1].replace(/"/g, '').trim();
      const orgIdStr = parts[4].trim();
      let orgId = orgIdStr ? parseInt(orgIdStr, 10) : null;
      
      const cupoStr = parts[5].trim();
      const cupo = cupoStr ? parseInt(cupoStr, 10) : 30;

      const lugar = parts[6].trim() || null;
      const descripcion = parts[7].trim() || null;
      
      const horasStr = parts[8] ? parts[8].trim() : null;
      const horas = horasStr ? parseInt(horasStr, 10) : null;

      if (!isNaN(id)) {
        try {
          // Si orgId es null (el proyecto NO tenía organización en la db antigua),
          // vamos a usar org_id: 0 por compatibilidad como se hizo antes
          const dataToUpdate = {
            duration: duracion || null,
            location: lugar,
            accredited_hours: isNaN(horas) ? null : horas,
          };
          if (orgId !== null && !isNaN(orgId)) {
            dataToUpdate.org_id = orgId;
          }
          await prisma.project.update({
            where: { id },
            data: dataToUpdate
          });
          updated++;
        } catch (e) {
          console.error(`Error actualizando proyecto ${id}:`, e.message);
        }
      }
    }
  }
  console.log(`Updated ${updated} projects.`);
}

processData().catch(console.error).finally(() => prisma.$disconnect());
