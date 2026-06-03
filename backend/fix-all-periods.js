const prisma = require('./prismaClient');

const PERIODOS = ['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'];

async function fixAllPeriods() {
  // 1. Get the 4 real periods
  const allPeriods = await prisma.fairPeriod.findMany();
  const periodMap = {};
  PERIODOS.forEach(n => {
    const found = allPeriods.find(p => p.name === n);
    if (found) periodMap[n] = found.id;
  });
  console.log('Period map:', periodMap);

  // 2. Fix ALL projects - assign period based on project id % 4
  const projects = await prisma.project.findMany();
  let projUpdated = 0;
  for (const proj of projects) {
    const pName = PERIODOS[proj.id % PERIODOS.length];
    const pid = periodMap[pName];
    if (pid && proj.period_id !== pid) {
      await prisma.project.update({ where: { id: proj.id }, data: { period_id: pid } });
      projUpdated++;
    }
  }
  console.log(`Updated ${projUpdated} projects`);

  // 3. Fix ALL enrollments - assign period based on enrollment id % 4
  const enrollments = await prisma.enrollment.findMany();
  let enrollUpdated = 0;
  for (const enroll of enrollments) {
    const pName = PERIODOS[enroll.id % PERIODOS.length];
    const pid = periodMap[pName];
    if (pid && enroll.period_id !== pid) {
      await prisma.enrollment.update({ where: { id: enroll.id }, data: { period_id: pid } });
      enrollUpdated++;
    }
  }
  console.log(`Updated ${enrollUpdated} enrollments`);

  // 4. Verify
  const sample = await prisma.enrollment.findFirst({ include: { fair_period: true } });
  console.log('\nSample enrollment after fix:');
  console.log(`  id=${sample.id}, period_id=${sample.period_id}, period_name=${sample.fair_period?.name}`);
}

fixAllPeriods().catch(console.error).finally(() => prisma.$disconnect());
