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

async function migrateCarreraAndFields() {
  console.log('=== MIGRANDO CAMPOS FALTANTES ===\n');

  await oldDb.connect();
  console.log('Conectado a antigua DB');

  // Get old estudiantes with carrera
  const resEstudiantes = await oldDb.query(`
    SELECT e.id_usuario, e.matricula, e.carrera, e.celular,
           e.hora_llegada, e.hora_salida,
           u.username, u.correo,
           u."nombre" as nombre_col
    FROM estudiantes e
    LEFT JOIN usuarios u ON u.id_usuario = e.id_usuario
  `);
  const oldStudents = resEstudiantes.rows;
  console.log(`  Encontrados ${oldStudents.length} estudiantes en antigua DB\n`);

  let updated = 0;
  let skipped = 0;

  for (const est of oldStudents) {
    const existing = await prisma.student.findUnique({ 
      where: { user_id: Number(est.id_usuario) } 
    });

    if (existing) {
      await prisma.student.update({
        where: { user_id: Number(est.id_usuario) },
        data: {
          carrera: est.carrera || existing.carrera,
          phone: est.celular || existing.phone,
          hora_registro: est.hora_llegada ? String(est.hora_llegada) : existing.hora_registro,
        }
      });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`  ✅ Actualizados ${updated} estudiantes con carrera`);
  if (skipped > 0) console.log(`  ⚠️  ${skipped} estudiantes no encontrados en nueva DB`);

  // Get old usuarios for nombre/apellidos
  let resUsuarios;
  try {
    resUsuarios = await oldDb.query(`SELECT id_usuario, correo FROM usuarios LIMIT 5`);
    // Check column names in usuarios
    const userCols = await oldDb.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'usuarios' ORDER BY ordinal_position
    `);
    console.log(`\n  Columnas de usuarios: ${userCols.rows.map(c => c.column_name).join(', ')}`);
  } catch (err) {
    console.log('  Tabla usuarios no accesible:', err.message);
  }

  await oldDb.end();

  // Final verification
  console.log('\n=== VERIFICACIÓN ===');
  const withCarrera = await prisma.student.count({ where: { carrera: { not: null } } });
  const total = await prisma.student.count();
  console.log(`  Estudiantes con carrera: ${withCarrera}/${total}`);
  
  const samples = await prisma.student.findMany({
    where: { carrera: { not: null } },
    take: 3,
    select: { user_id: true, matricula: true, full_name: true, carrera: true }
  });
  samples.forEach(s => {
    console.log(`  - ${s.matricula} | ${s.full_name} | ${s.carrera}`);
  });

  console.log('\n✅ Migración de campos completada');
}

migrateCarreraAndFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
