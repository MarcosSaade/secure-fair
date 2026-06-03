require('dotenv').config();
const { Client, Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const oldDbClient = new Client({
  user: 'postgres',
  password: '12345',
  host: 'localhost',
  port: 5433,
  database: 'mi_base_backup_proyectos_2'
});

async function migrateData() {
  await oldDbClient.connect();
  console.log('Conectado a la antigua base de datos.');

  try {
    // 1. Crear un periodo de feria por defecto
    const defaultPeriod = await prisma.fairPeriod.create({
      data: {
        name: 'Periodo por Defecto 2026',
        starts_at: new Date(),
        ends_at: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 meses
        is_active: true,
      }
    });
    console.log('Periodo por defecto creado con ID:', defaultPeriod.id);

    // 2. Migrar organizaciones PRIMERO (antes que usuarios para FK)
    const resOrganizaciones = await oldDbClient.query('SELECT * FROM organizaciones');
    const organizaciones = resOrganizaciones.rows;
    for (const o of organizaciones) {
      await prisma.organization.upsert({
        where: { id: Number(o.id_organizacion) },
        update: {},
        create: {
          id: Number(o.id_organizacion),
          name: o.nombre_osf || `Org ${o.id_organizacion}`,
          created_at: new Date(),
        }
      });
    }
    console.log(`Migradas ${organizaciones.length} organizaciones.`);

    // 3. Migrar usuarios
    const resUsuarios = await oldDbClient.query('SELECT * FROM usuarios');
    const resProyectosForOrg = await oldDbClient.query('SELECT DISTINCT id_organizacion FROM proyectos WHERE id_organizacion IS NOT NULL');
    const orgIds = resProyectosForOrg.rows.map(r => Number(r.id_organizacion));

    const usuarios = resUsuarios.rows;
    for (const u of usuarios) {
      let orgId = null;
      if (u.tipo === 'OSF') {
        // Match by offset: user 101 -> org 1, user 102 -> org 2, etc.
        const guessedOrgId = Number(u.id_usuario) - 100;
        orgId = orgIds.includes(guessedOrgId) ? guessedOrgId : (orgIds[0] || null);
      }

      await prisma.user.upsert({
        where: { id: Number(u.id_usuario) },
        update: {},
        create: {
          id: Number(u.id_usuario),
          email: u.correo || `user_${u.id_usuario}@example.com`,
          username: u.username || null,
          password_hash: u.contraseña || 'password_dummy',
          role: (u.tipo === 'OSF' || u.tipo === 'Socio Formador') ? 'socio' : (u.tipo === 'admin' || u.tipo === 'Admin') ? 'admin' : u.tipo === 'becario' ? 'becario' : 'student',
          org_id: orgId,
          is_active: u.activo !== false,
          created_at: new Date(),
        }
      });
    }
    console.log(`Migrados ${usuarios.length} usuarios.`);

    // 4. Migrar estudiantes
    const resEstudiantes = await oldDbClient.query('SELECT * FROM estudiantes');
    const estudiantes = resEstudiantes.rows;
    for (const e of estudiantes) {
      // Ensure user exists for this student
      await prisma.user.upsert({
        where: { id: Number(e.id_usuario) },
        update: {},
        create: {
          id: Number(e.id_usuario),
          email: e.correo || `student_${e.id_usuario}@example.com`,
          username: e.username || null,
          password_hash: 'password_dummy',
          role: 'student',
          is_active: true,
          created_at: new Date(),
        }
      });

      try {
        await prisma.student.upsert({
          where: { user_id: Number(e.id_usuario) },
          update: {},
          create: {
            user_id: Number(e.id_usuario),
            matricula: e.matricula || `A0${e.id_usuario}`,
            full_name: `${e.nombre || ''} ${e.apellidos || ''}`.trim() || e.username || 'Sin Nombre',
            phone: e.celular || null,
          }
        });
      } catch (dupErr) {
        if (dupErr.code === 'P2002') {
          // Matricula duplicate: add suffix to make unique
          await prisma.student.upsert({
            where: { user_id: Number(e.id_usuario) },
            update: {},
            create: {
              user_id: Number(e.id_usuario),
              matricula: `${e.matricula || 'A0'}_${e.id_usuario}`,
              full_name: `${e.nombre || ''} ${e.apellidos || ''}`.trim() || e.username || 'Sin Nombre',
              phone: e.celular || null,
            }
          });
        } else {
          throw dupErr;
        }
      }
    }
    console.log(`Migrados ${estudiantes.length} estudiantes.`);

    // 5. Migrar proyectos
    const resProyectos = await oldDbClient.query('SELECT * FROM proyectos');
    const proyectos = resProyectos.rows;
    for (const p of proyectos) {
      let cupo = parseInt(p['cupo estudiantes']);
      if (isNaN(cupo)) cupo = 30; // default

      await prisma.project.upsert({
        where: { id: Number(p.id_proyecto) },
        update: {},
        create: {
          id: Number(p.id_proyecto),
          org_id: p.id_organizacion ? Number(p.id_organizacion) : (organizaciones[0] ? Number(organizaciones[0].id_organizacion) : null),
          period_id: defaultPeriod.id,
          name: p['Nombre proyecto'] || `Proyecto ${p.id_proyecto}`,
          description: p.descripcion_proyecto || null,
          capacity: cupo,
          is_active: true,
        }
      });
    }
    console.log(`Migrados ${proyectos.length} proyectos.`);

    // 6. Migrar inscripciones
    const resInscripciones = await oldDbClient.query('SELECT * FROM inscripciones');
    const inscripciones = resInscripciones.rows;
    for (const i of inscripciones) {
      // Evitar duplicados por unique (student_user_id, period_id)
      const existing = await prisma.enrollment.findFirst({
        where: {
          student_user_id: Number(i.id_usuario),
          period_id: defaultPeriod.id,
        }
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            id: Number(i.id_inscripcion),
            period_id: defaultPeriod.id,
            project_id: Number(i.id_proyecto),
            student_user_id: Number(i.id_usuario),
            accepted_rules: false,
            created_at: new Date(),
          }
        });
      }
    }
    console.log(`Migradas ${inscripciones.length} inscripciones.`);

    console.log('¡Migración completada con éxito!');
  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await oldDbClient.end();
    await prisma.$disconnect();
  }
}

migrateData();
