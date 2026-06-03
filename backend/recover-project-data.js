const fs = require('fs');
const prisma = require('./prismaClient');
const path = require('path');

async function recoverProjectData() {
  const sqlPath = path.join(__dirname, '../dump-mi_base_backup_proyectos-202605111903.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  console.log('Iniciando recuperación de datos de proyectos...');

  // Match lines like:
  // COPY public.proyectos (id_proyecto, duracion, "Nombre proyecto", "# de inscritos", id_organizacion, "cupo estudiantes", lugar, descripcion_proyecto, horas) FROM stdin;
  // 1	2 horas	Proyecto Vida	1	1	30	Auditorio	Desc	10
  
  const copyRegex = /COPY public\.proyectos \([^)]+\) FROM stdin;\r?\n([\s\S]*?)\r?\n\\\./g;
  const match = copyRegex.exec(sqlContent);
  
  if (!match) {
    console.error('No se encontró el bloque COPY de proyectos en el archivo SQL.');
    return;
  }

  const lines = match[1].split('\n').filter(line => line.trim() !== '');
  let updatedCount = 0;

  for (const line of lines) {
    const parts = line.split('\t');
    // Schema in SQL: 
    // 0: id_proyecto
    // 1: duracion
    // 2: Nombre proyecto
    // 3: # de inscritos
    // 4: id_organizacion
    // 5: cupo estudiantes
    // 6: lugar
    // 7: descripcion_proyecto
    // 8: horas
    
    if (parts.length >= 9) {
      const id = parseInt(parts[0], 10);
      const duracion = parts[1] === '\\N' ? null : parts[1];
      const lugar = parts[6] === '\\N' ? null : parts[6];
      const horasStr = parts[8].replace(/\\r$/, '');
      const horas = horasStr === '\\N' ? null : parseInt(horasStr, 10);

      try {
        await prisma.project.update({
          where: { id: id },
          data: {
            duration: duracion,
            location: lugar,
            accredited_hours: horas !== null && !isNaN(horas) ? horas : null
          }
        });
        updatedCount++;
        console.log(`Proyecto ${id} recuperado: duracion=${duracion}, lugar=${lugar}, horas=${horas}`);
      } catch (err) {
        if (err.code === 'P2025') {
          console.warn(`Proyecto ${id} no encontrado en la DB actual, se omite.`);
        } else {
          console.error(`Error actualizando proyecto ${id}:`, err);
        }
      }
    }
  }

  console.log(`\n¡Recuperación completada! Se actualizaron ${updatedCount} proyectos.`);
}

recoverProjectData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
