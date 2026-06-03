const prisma = require('./prismaClient');
async function check() {
  const projects = await prisma.project.findMany();
  const orgs = await prisma.organization.findMany();
  const orgIds = orgs.map(o => o.id);
  const invalid = projects.filter(p => !orgIds.includes(p.org_id));
  console.log(invalid.length, 'projects have invalid org_ids');
}
check().finally(() => prisma.$disconnect());
