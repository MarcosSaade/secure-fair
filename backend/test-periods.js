const prisma = require('./prismaClient');
prisma.fairPeriod.findMany().then(r => console.log(r)).finally(() => prisma.$disconnect());
