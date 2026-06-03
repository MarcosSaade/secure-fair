require('dotenv').config();
const prisma = require('./prismaClient');

async function fixAdminAndMigrateFields() {
  console.log('=== INICIANDO CORRECCIONES ===\n');

  // ============================================================
  // 1. ARREGLAR / RECREAR ADMIN CON CREDENCIALES CORRECTAS
  // ============================================================
  console.log('1. Arreglando usuario admin...');
  
  // Update admin user with proper email/username
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: 'admin@securefair.com',
        username: 'admin',
        password_hash: 'pass1',
        is_active: true,
      }
    });
    console.log(`  ✅ Admin actualizado: username="admin" email="admin@securefair.com" password="pass1"`);
  } else {
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@securefair.com',
        username: 'admin',
        password_hash: 'pass1',
        role: 'admin',
        is_active: true,
      }
    });
    console.log(`  ✅ Admin creado: id=${newAdmin.id} username="admin" email="admin@securefair.com" password="pass1"`);
  }

  // ============================================================
  // 2. MIGRAR DATOS DE ESTUDIANTES DESDE LA ANTIGUA DB
  // ============================================================
  console.log('\n2. Intentando migrar carrera/apellidos desde antigua DB...');
  
  const { Client } = require('pg');
  const oldDb = new Client({
    user: 'postgres',
    password: '12345',
    host: 'localhost',
    port: 5433,
    database: 'mi_base_backup_proyectos_2'
  });

  try {
    await oldDb.connect();
    console.log('  Conectado a antigua DB');

    const result = await oldDb.query('SELECT id_usuario, nombre, apellidos, carrera, correo, celular, hora_registro, matricula FROM estudiantes');
    const oldStudents = result.rows;
    
    let updated = 0;
    let notFound = 0;

    for (const est of oldStudents) {
      const existing = await prisma.student.findUnique({ where: { user_id: Number(est.id_usuario) } });
      if (existing) {
        await prisma.student.update({
          where: { user_id: Number(est.id_usuario) },
          data: {
            carrera: est.carrera || null,
            apellidos: est.apellidos || null,
            hora_registro: est.hora_registro || null,
            correo_personal: est.correo || null,
            phone: est.celular || existing.phone,
            // Split full_name correctly
            full_name: `${est.nombre || ''} ${est.apellidos || ''}`.trim() || existing.full_name,
          }
        });
        updated++;
      } else {
        notFound++;
      }
    }

    console.log(`  ✅ Actualizados ${updated} estudiantes con carrera/apellidos`);
    if (notFound > 0) console.log(`  ⚠️  ${notFound} estudiantes no encontrados en nueva DB (OK, son nuevos)`);

    await oldDb.end();
  } catch (err) {
    console.log(`  ⚠️  No se pudo conectar a antigua DB: ${err.message}`);
    console.log('  (Si ya no tienes la antigua DB, esto es normal)');
  }

  // ============================================================
  // 3. VERIFICACIÓN FINAL
  // ============================================================
  console.log('\n3. Verificación final...');
  
  const adminCheck = await prisma.user.findFirst({ where: { role: 'admin' } });
  console.log(`  Admin: email="${adminCheck?.email}" username="${adminCheck?.username}" pass="${adminCheck?.password_hash}"`);

  const studentsWithCarrera = await prisma.student.count({ where: { carrera: { not: null } } });
  const totalStudents = await prisma.student.count();
  console.log(`  Estudiantes con carrera: ${studentsWithCarrera}/${totalStudents}`);

  const sample = await prisma.student.findFirst({ where: { carrera: { not: null } } });
  if (sample) {
    console.log(`  Ejemplo: matricula="${sample.matricula}" carrera="${sample.carrera}" apellidos="${sample.apellidos}"`);
  }

  console.log('\n=== CORRECCIONES COMPLETADAS ===');
  console.log('\n📋 CREDENCIALES DE ACCESO:');
  console.log('  ADMIN:   username="admin" | email="admin@securefair.com" | password="pass1"');
  console.log('  BECARIO: username="becario" | password="pass1"');
}

fixAdminAndMigrateFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
