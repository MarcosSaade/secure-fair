require('dotenv').config();
const prisma = require('./prismaClient');

async function main() {
  // 1. Show admin with password
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  console.log('ADMIN ACTUAL:');
  console.log(`  id: ${admin?.id}`);
  console.log(`  email: "${admin?.email}"`);
  console.log(`  username: "${admin?.username}"`);
  console.log(`  password: "${admin?.password_hash}"`);
  console.log('');

  // 2. Show all non-student users (socios, becarios, admins)
  const nonStudents = await prisma.user.findMany({
    where: { role: { not: 'student' } },
    select: { id: true, email: true, username: true, role: true, password_hash: true, org_id: true }
  });
  console.log('NON-STUDENT USERS:');
  nonStudents.forEach(u => {
    console.log(`  [${u.role}] id=${u.id} email="${u.email}" user="${u.username}" pass="${u.password_hash}" org=${u.org_id}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
