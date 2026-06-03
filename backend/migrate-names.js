require('dotenv').config();
const { Client } = require('pg');
const prisma = require('./prismaClient');

const oldDb = new Client({
  user: 'postgres',
  password: '12345',
  host: 'localhost',
  port: 5433,
  database: 'mi_base_backup_proyectos_2'
});

async function migrateNames() {
  console.log('=== MIGRANDO NOMBRES COMPLETOS ===\n');
  await oldDb.connect();

  // Get old usuarios with nombre
  const resUsuarios = await oldDb.query(`
    SELECT u.id_usuario, u.nombre, u.correo,
           e.carrera, e.celular, e.matricula, e.hora_llegada
    FROM usuarios u
    LEFT JOIN estudiantes e ON e.id_usuario = u.id_usuario
    WHERE u.tipo = 'Alumno' OR u.tipo = 'student' OR u.tipo = 'estudiante'
  `);
  const oldUsers = resUsuarios.rows;
  console.log(`Encontrados ${oldUsers.length} usuarios estudiantes con nombre\n`);

  let updated = 0;
  for (const u of oldUsers) {
    const existing = await prisma.student.findUnique({ where: { user_id: Number(u.id_usuario) } });
    if (existing) {
      const updateData = {};
      if (u.nombre && u.nombre.trim()) updateData.full_name = u.nombre.trim();
      if (u.carrera) updateData.carrera = u.carrera;
      if (u.celular) updateData.phone = u.celular;
      if (u.hora_llegada) updateData.hora_registro = String(u.hora_llegada);
      if (u.correo) updateData.correo_personal = u.correo;

      if (Object.keys(updateData).length > 0) {
        await prisma.student.update({ where: { user_id: Number(u.id_usuario) }, data: updateData });
        updated++;
      }
    }
  }
  console.log(`✅ Actualizados ${updated} estudiantes con nombre completo`);

  // Also check all users for admin/becario etc.
  const resAllUsers = await oldDb.query(`SELECT id_usuario, username, correo, nombre, tipo FROM usuarios`);
  console.log(`\nTipos de usuario en antigua DB: ${[...new Set(resAllUsers.rows.map(u => u.tipo))].join(', ')}`);

  // Find original admin user
  const oldAdmin = resAllUsers.rows.find(u => u.tipo === 'admin' || u.tipo === 'Admin');
  if (oldAdmin) {
    console.log(`\nAdmin original: id=${oldAdmin.id_usuario} username="${oldAdmin.username}" correo="${oldAdmin.correo}" nombre="${oldAdmin.nombre}"`);
  }

  await oldDb.end();

  // Final check
  const samples = await prisma.student.findMany({
    where: { carrera: { not: null } },
    take: 5,
    select: { user_id: true, matricula: true, full_name: true, carrera: true, apellidos: true }
  });
  console.log('\nEjemplos de estudiantes con carrera:');
  samples.forEach(s => console.log(`  ${s.matricula} | ${s.full_name} | ${s.carrera}`));
}

migrateNames().catch(console.error).finally(() => prisma.$disconnect());
