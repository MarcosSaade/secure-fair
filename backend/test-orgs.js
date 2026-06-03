const prisma = require('./prismaClient');
prisma.project.findMany({ include: { organization: true } })
  .then(res => {
    console.log("Missing org count:", res.filter(x => !x.organization).length);
    console.log("First 3 projects:");
    console.log(res.slice(0, 3));
  })
  .finally(() => prisma.$disconnect());
