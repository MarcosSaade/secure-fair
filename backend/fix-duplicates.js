const prisma = require('./prismaClient');

async function fixDuplicates() {
  console.log('Buscando inscripciones duplicadas...');
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { created_at: 'asc' }
  });

  const seen = new Set();
  let deleted = 0;

  for (const e of enrollments) {
    const key = `${e.student_user_id}-${e.project_id}`;
    if (seen.has(key)) {
      // Duplicado encontrado! Eliminar.
      console.log(`Eliminando duplicado: id=${e.id} estudiante=${e.student_user_id} proyecto=${e.project_id}`);
      await prisma.enrollment.delete({ where: { id: e.id } });
      deleted++;
    } else {
      seen.add(key);
    }
  }

  console.log(`Se eliminaron ${deleted} inscripciones duplicadas.`);
}

fixDuplicates().catch(console.error).finally(() => prisma.$disconnect());
