const prisma = require('./prismaClient');
prisma.user.findMany({
  orderBy: { id: 'desc' },
  take: 2,
  include: { student: true }
}).then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
