const prisma = require('./prismaClient');
async function check() {
  const enrollments = await prisma.enrollment.findMany({ 
    include: { fair_period: true },
    take: 10
  });
  console.log('Sample enrollments:');
  enrollments.forEach(e => console.log(`  id=${e.id} period_id=${e.period_id} period_name=${e.fair_period?.name}`));
  
  const periods = await prisma.fairPeriod.findMany();
  console.log('\nAll FairPeriods:');
  periods.forEach(p => console.log(`  id=${p.id} name=${p.name}`));
}
check().finally(() => prisma.$disconnect());
