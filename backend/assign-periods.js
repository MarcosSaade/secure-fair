const prisma = require('./prismaClient');

const PERIODOS = ['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'];

async function assignPeriods() {
  const enrollments = await prisma.enrollment.findMany();
  console.log(`Found ${enrollments.length} enrollments to update`);
  let updated = 0;

  for (const enroll of enrollments) {
    // Assign a random period if none set, or if it's a generic "Periodo por Defecto" value
    const needsUpdate = !enroll.periodo || enroll.periodo.includes('Defecto') || enroll.periodo.includes('2026');
    if (needsUpdate) {
      const period = PERIODOS[enroll.id % PERIODOS.length]; // deterministic based on id
      await prisma.enrollment.update({
        where: { id: enroll.id },
        data: { periodo: period }
      });
      updated++;
    }
  }

  // Also update projects with the same assignment 
  const projects = await prisma.project.findMany();
  for (const proj of projects) {
    const period = PERIODOS[proj.id % PERIODOS.length];
    // We store the periodo in enrollments, not projects. 
    // But let's also update duration/location for ones that are still null
    if (!proj.duration) {
      const durations = ['3 semanas', '5 semanas', 'Campus CCM'];
      const dur = proj.id < 11 ? '3 semanas' : proj.id === 49 ? 'Campus CCM' : '5 semanas';
      await prisma.project.update({
        where: { id: proj.id },
        data: { duration: dur }
      }).catch(() => {});
    }
  }

  console.log(`Updated ${updated} enrollments with periods`);
}

assignPeriods().catch(console.error).finally(() => prisma.$disconnect());
