const prisma = require('./prismaClient');

const PERIODOS = ['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'];

async function setupPeriods() {
  // 1. Create the 4 real FairPeriod records (skip if already exist)
  const existing = await prisma.fairPeriod.findMany();
  const existingNames = existing.map(p => p.name);

  const now = new Date();
  const periodDates = {
    'Invierno': { starts: new Date('2025-12-01'), ends: new Date('2026-02-28') },
    'Verano':   { starts: new Date('2026-06-01'), ends: new Date('2026-08-31') },
    'Ago-Dic':  { starts: new Date('2025-08-01'), ends: new Date('2025-12-31') },
    'Ene-Jul':  { starts: new Date('2026-01-01'), ends: new Date('2026-07-31') },
  };

  const periodMap = {}; // name -> id
  for (const name of PERIODOS) {
    const found = existing.find(p => p.name === name);
    if (found) {
      periodMap[name] = found.id;
      console.log(`FairPeriod "${name}" already exists with id=${found.id}`);
    } else {
      const created = await prisma.fairPeriod.create({
        data: {
          name,
          starts_at: periodDates[name].starts,
          ends_at: periodDates[name].ends,
          is_active: true
        }
      });
      periodMap[name] = created.id;
      console.log(`Created FairPeriod "${name}" with id=${created.id}`);
    }
  }

  // 2. Re-assign all enrollments to one of the 4 real periods
  const enrollments = await prisma.enrollment.findMany();
  console.log(`\nRe-assigning ${enrollments.length} enrollments...`);

  let updated = 0;
  for (const enroll of enrollments) {
    const periodName = PERIODOS[enroll.id % PERIODOS.length];
    const newPeriodId = periodMap[periodName];
    if (enroll.period_id !== newPeriodId) {
      await prisma.enrollment.update({
        where: { id: enroll.id },
        data: { period_id: newPeriodId }
      });
      updated++;
    }
  }

  // 3. Also move projects to the correct period_id (use the new period ids)
  const projects = await prisma.project.findMany();
  for (const proj of projects) {
    const periodName = PERIODOS[proj.id % PERIODOS.length];
    const newPeriodId = periodMap[periodName];
    await prisma.project.update({
      where: { id: proj.id },
      data: { period_id: newPeriodId }
    });
  }

  console.log(`Updated ${updated} enrollments`);
  console.log(`Updated ${projects.length} projects`);
  console.log('\nPeriod map:', periodMap);
}

setupPeriods().catch(console.error).finally(() => prisma.$disconnect());
