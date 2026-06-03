require('dotenv').config();
const prisma = require('./prismaClient');

async function finalFixes() {
  console.log('=== CORRECCIONES FINALES ===\n');

  // 1. Update admin with proper name
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  await prisma.user.update({
    where: { id: adminUser.id },
    data: {
      email: 'admin@securefair.com',
      username: 'admin',
      password_hash: 'pass1',
    }
  });
  console.log('✅ Admin: username="admin" email="admin@securefair.com" password="pass1"');

  // 2. Clean up students whose full_name is still an email (user0@example.com etc.)
  const badStudents = await prisma.student.findMany({
    where: { full_name: { contains: '@example.com' } }
  });
  console.log(`\n  Estudiantes con email como nombre: ${badStudents.length}`);
  
  // Keep as is — these are migrated students without a real name from old DB
  // They will get a proper name when they log in and complete their registration

  // 3. Summary
  const total = await prisma.student.count();
  const withCarrera = await prisma.student.count({ where: { carrera: { not: null } } });
  const withPhone = await prisma.student.count({ where: { phone: { not: null } } });
  const withEmail = await prisma.student.count({ where: { correo_personal: { not: null } } });

  console.log('\n=== RESUMEN DE DATOS ===');
  console.log(`  Total estudiantes: ${total}`);
  console.log(`  Con carrera:       ${withCarrera}`);
  console.log(`  Con teléfono:      ${withPhone}`);
  console.log(`  Con correo:        ${withEmail}`);

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  const becario = await prisma.user.findFirst({ where: { role: 'becario' } });

  console.log('\n=== CREDENCIALES DEL SISTEMA ===');
  console.log(`  ADMIN:   username="${admin?.username}" | email="${admin?.email}" | password="${admin?.password_hash}"`);
  console.log(`  BECARIO: username="${becario?.username}" | email="${becario?.email}" | password="${becario?.password_hash}"`);
  
  const socios = await prisma.user.findMany({ where: { role: 'socio' }, take: 3, include: { organization: true } });
  console.log('  SOCIOS (ejemplos):');
  socios.forEach(s => console.log(`    username="${s.username}" | org="${s.organization?.name}" | password="${s.password_hash}"`));

  console.log('\n✅ Todo listo. Reinicia el backend para aplicar los cambios.');
}

finalFixes().catch(console.error).finally(() => prisma.$disconnect());
