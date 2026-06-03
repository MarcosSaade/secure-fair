const prisma = require('./prismaClient');
async function main() {
  const periods = await prisma.fairPeriod.findMany();
  console.log("PERIODS:", periods);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
