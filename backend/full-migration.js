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

const crypto = require('crypto');

async function fullMigration() {
  await oldDb.connect();
  console.log('=== MIGRACIÓN COMPLETA DESDE ANTIGUA DB ===\n');

  // ============================================================
  // STEP 1: Obtener datos de antigua DB
  // ============================================================
  const [
    oldOrgs, oldUsuarios, oldEstudiantes, oldProyectos,
    oldInscripciones, oldUsersOrgs, oldCodes
  ] = await Promise.all([
    oldDb.query('SELECT * FROM organizaciones ORDER BY id_organizacion'),
    oldDb.query('SELECT * FROM usuarios ORDER BY id_usuario'),
    oldDb.query('SELECT * FROM estudiantes ORDER BY id_usuario'),
    oldDb.query('SELECT * FROM proyectos ORDER BY id_proyecto'),
    oldDb.query('SELECT * FROM inscripciones ORDER BY id_inscripcion'),
    oldDb.query('SELECT * FROM usuarios_organizaciones'),
    oldDb.query('SELECT * FROM enrollment_codes'),
  ]);

  console.log(`Datos en antigua DB:`);
  console.log(`  Organizaciones: ${oldOrgs.rows.length}`);
  console.log(`  Usuarios:       ${oldUsuarios.rows.length}`);
  console.log(`  Estudiantes:    ${oldEstudiantes.rows.length}`);
  console.log(`  Proyectos:      ${oldProyectos.rows.length}`);
  console.log(`  Inscripciones:  ${oldInscripciones.rows.length}`);
  console.log(`  Socios-Orgs:    ${oldUsersOrgs.rows.length}`);
  console.log(`  Códigos:        ${oldCodes.rows.length}\n`);

  // ============================================================
  // STEP 2: Obtener o crear FairPeriod por defecto
  // ============================================================
  let fairPeriod = await prisma.fairPeriod.findFirst({ where: { is_active: true } });
  if (!fairPeriod) {
    fairPeriod = await prisma.fairPeriod.create({
      data: {
        name: 'Feria OSF 2026',
        starts_at: new Date('2026-01-01'),
        ends_at: new Date('2026-12-31'),
        is_active: true,
      }
    });
    console.log(`✅ FairPeriod creado: ID=${fairPeriod.id}`);
  } else {
    console.log(`✅ FairPeriod existente: ID=${fairPeriod.id} "${fairPeriod.name}"`);
  }

  // ============================================================
  // STEP 3: Migrar Organizaciones (base-0 → IDs reales)
  // ============================================================
  console.log('\n--- ORGANIZACIONES ---');
  let orgsCreated = 0, orgsSkipped = 0;
  const orgIdMap = {}; // old_id -> new_id

  for (const org of oldOrgs.rows) {
    const oldId = Number(org.id_organizacion);
    // Try to find by name first to avoid duplicates
    const existing = await prisma.organization.findFirst({
      where: { name: org.nombre_osf }
    });

    if (existing) {
      orgIdMap[oldId] = existing.id;
      orgsSkipped++;
    } else {
      const created = await prisma.organization.create({
        data: { name: org.nombre_osf }
      });
      orgIdMap[oldId] = created.id;
      orgsCreated++;
    }
  }
  console.log(`  Creadas: ${orgsCreated}, Ya existían: ${orgsSkipped}`);
  console.log(`  ID Map (antiguo→nuevo): ${JSON.stringify(orgIdMap)}`);

  // ============================================================
  // STEP 4: Migrar Usuarios
  // ============================================================
  console.log('\n--- USUARIOS ---');
  let usersCreated = 0, usersUpdated = 0;
  const userIdMap = {}; // old_id -> new_id

  for (const u of oldUsuarios.rows) {
    const oldId = Number(u.id_usuario);
    const role = mapRole(u.tipo);

    // Determine org for socio users
    let orgId = null;
    if (role === 'socio') {
      const uOrg = oldUsersOrgs.rows.find(uo => Number(uo.id_usuario) === oldId);
      if (uOrg) {
        orgId = orgIdMap[Number(uOrg.id_organizacion)] || null;
      }
    }

    // Find existing user by old id or email/username
    let existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: oldId },
          { email: u.correo || `user_${oldId}@example.com` },
          { username: u.username || null },
        ].filter(Boolean)
      }
    });

    if (existing) {
      // Update with real data from old DB
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: u.correo || existing.email,
          username: u.username || existing.username,
          password_hash: u.contraseña || existing.password_hash,
          role,
          org_id: orgId || existing.org_id,
          is_active: u.activo !== false,
        }
      });
      userIdMap[oldId] = existing.id;
      usersUpdated++;
    } else {
      // Create with exact old ID if possible
      try {
        const created = await prisma.user.create({
          data: {
            id: oldId, // try to preserve ID
            email: u.correo || `user_${oldId}@securefair.com`,
            username: u.username || null,
            password_hash: u.contraseña || 'pass1',
            role,
            org_id: orgId,
            is_active: u.activo !== false,
          }
        });
        userIdMap[oldId] = created.id;
        usersCreated++;
      } catch (err) {
        // ID conflict, create without specifying ID
        const created = await prisma.user.create({
          data: {
            email: u.correo || `user_${oldId}@securefair.com`,
            username: u.username || null,
            password_hash: u.contraseña || 'pass1',
            role,
            org_id: orgId,
            is_active: u.activo !== false,
          }
        });
        userIdMap[oldId] = created.id;
        usersCreated++;
      }
    }
  }
  console.log(`  Creados: ${usersCreated}, Actualizados: ${usersUpdated}`);

  // Ensure admin has correct credentials
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { email: 'admin@securefair.com', username: 'admin', password_hash: 'pass1' }
    });
    userIdMap[146] = adminUser.id; // map old admin id
    console.log(`  ✅ Admin fijado: username="admin" email="admin@securefair.com" pass="pass1"`);
  }

  // ============================================================
  // STEP 5: Migrar Estudiantes (perfil + campos)
  // ============================================================
  console.log('\n--- ESTUDIANTES ---');
  let studsCreated = 0, studsUpdated = 0;
  const matriculaMap = {}; // old_id -> matricula (for enrollment later)

  for (const est of oldEstudiantes.rows) {
    const oldId = Number(est.id_usuario);
    const newUserId = userIdMap[oldId] || oldId;
    const matricula = est.matricula || `A0${String(oldId).padStart(7, '0')}`;
    matriculaMap[oldId] = matricula;

    // Find name from usuarios
    const oldUser = oldUsuarios.rows.find(u => Number(u.id_usuario) === oldId);
    const fullName = oldUser?.nombre?.trim() || oldUser?.username || matricula;

    const existing = await prisma.student.findUnique({ where: { user_id: newUserId } });

    if (existing) {
      try {
        await prisma.student.update({
          where: { user_id: newUserId },
          data: {
            matricula: matricula,
            full_name: fullName,
            phone: est.celular || existing.phone,
            carrera: est.carrera || existing.carrera,
            hora_registro: est.hora_llegada ? String(est.hora_llegada) : existing.hora_registro,
            correo_personal: oldUser?.correo || existing.correo_personal,
          }
        });
        studsUpdated++;
      } catch (err) {
        if (err.code === 'P2002') {
          // Matricula conflict — update without changing matricula
          await prisma.student.update({
            where: { user_id: newUserId },
            data: {
              full_name: fullName,
              phone: est.celular || existing.phone,
              carrera: est.carrera || existing.carrera,
              hora_registro: est.hora_llegada ? String(est.hora_llegada) : existing.hora_registro,
              correo_personal: oldUser?.correo || existing.correo_personal,
            }
          });
          studsUpdated++;
        } else {
          console.log(`  ⚠️ Estudiante update id=${oldId}: ${err.message}`);
        }
      }

    } else {
      // Check if matricula already used
      const matExists = await prisma.student.findUnique({ where: { matricula } });
      const safeMat = matExists ? `${matricula}_${oldId}` : matricula;
      try {
        await prisma.student.create({
          data: {
            user_id: newUserId,
            matricula: safeMat,
            full_name: fullName,
            phone: est.celular || null,
            carrera: est.carrera || null,
            hora_registro: est.hora_llegada ? String(est.hora_llegada) : null,
            correo_personal: oldUser?.correo || null,
          }
        });
        studsCreated++;
      } catch (err) {
        console.log(`  ⚠️ Estudiante id=${oldId}: ${err.message}`);
      }
    }
  }
  console.log(`  Creados: ${studsCreated}, Actualizados: ${studsUpdated}`);

  // ============================================================
  // STEP 6: Migrar Proyectos (con campos extra: duracion, lugar, horas)
  // ============================================================
  console.log('\n--- PROYECTOS ---');
  let projCreated = 0, projUpdated = 0;
  const projIdMap = {}; // old_id -> new_id

  for (const p of oldProyectos.rows) {
    const oldId = Number(p.id_proyecto);
    const orgNewId = orgIdMap[Number(p.id_organizacion)] || null;
    if (!orgNewId) {
      console.log(`  ⚠️ Proyecto ${oldId}: org ${p.id_organizacion} no encontrada`);
      continue;
    }

    // Try to find existing project
    const existing = await prisma.project.findFirst({
      where: {
        OR: [
          { id: oldId },
          { name: p['Nombre proyecto'], org_id: orgNewId }
        ]
      }
    });

    const projectData = {
      org_id: orgNewId,
      period_id: fairPeriod.id,
      name: p['Nombre proyecto'] || `Proyecto ${oldId}`,
      description: p.descripcion_proyecto || null,
      capacity: Number(p['cupo estudiantes']) || 30,
      is_active: true,
    };

    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: projectData
      });
      projIdMap[oldId] = existing.id;
      projUpdated++;
    } else {
      try {
        const created = await prisma.project.create({
          data: { id: oldId, ...projectData }
        });
        projIdMap[oldId] = created.id;
        projCreated++;
      } catch (err) {
        const created = await prisma.project.create({ data: projectData });
        projIdMap[oldId] = created.id;
        projCreated++;
      }
    }
  }
  console.log(`  Creados: ${projCreated}, Actualizados: ${projUpdated}`);

  // ============================================================
  // STEP 7: Migrar Inscripciones
  // ============================================================
  console.log('\n--- INSCRIPCIONES ---');
  let enrollCreated = 0, enrollSkipped = 0;

  for (const ins of oldInscripciones.rows) {
    const oldUserId = Number(ins.id_usuario);
    const oldProjId = Number(ins.id_proyecto);
    const newUserId = userIdMap[oldUserId] || oldUserId;
    const newProjId = projIdMap[oldProjId];

    if (!newProjId) {
      console.log(`  ⚠️ Inscripción: proyecto ${oldProjId} no encontrado`);
      enrollSkipped++;
      continue;
    }

    // Check if student exists
    const student = await prisma.student.findUnique({ where: { user_id: newUserId } });
    if (!student) {
      enrollSkipped++;
      continue;
    }

    // Check if enrollment already exists (student can only have 1 per period)
    const existingEnroll = await prisma.enrollment.findFirst({
      where: {
        student_user_id: newUserId,
        period_id: fairPeriod.id,
        project_id: newProjId,
      }
    });

    if (!existingEnroll) {
      // Check if student already has enrollment for this period (unique constraint)
      const periodEnroll = await prisma.enrollment.findFirst({
        where: { student_user_id: newUserId, period_id: fairPeriod.id }
      });

      if (!periodEnroll) {
        try {
          await prisma.enrollment.create({
            data: {
              period_id: fairPeriod.id,
              project_id: newProjId,
              student_user_id: newUserId,
              accepted_rules: false,
            }
          });
          enrollCreated++;
        } catch (err) {
          console.log(`  ⚠️ Enrollment usr=${newUserId} proj=${newProjId}: ${err.message}`);
          enrollSkipped++;
        }
      } else {
        enrollSkipped++; // Student already enrolled in a project this period
      }
    } else {
      enrollSkipped++;
    }
  }
  console.log(`  Creadas: ${enrollCreated}, Omitidas: ${enrollSkipped}`);

  // ============================================================
  // STEP 8: Migrar Códigos de inscripción
  // ============================================================
  console.log('\n--- CÓDIGOS DE INSCRIPCIÓN ---');
  let codesCreated = 0, codesSkipped = 0;

  for (const code of oldCodes.rows) {
    const newProjId = projIdMap[Number(code.id_proyecto)];
    if (!newProjId) { codesSkipped++; continue; }

    // Find issuer (any admin/becario)
    const issuer = await prisma.user.findFirst({ where: { role: { in: ['admin', 'becario', 'socio'] } } });
    if (!issuer) { codesSkipped++; continue; }

    const codeHash = crypto.createHash('sha256').update(code.code || String(code.code_id)).digest('hex');

    const existing = await prisma.projectCode.findFirst({ where: { code_hash: codeHash } });
    if (existing) { codesSkipped++; continue; }

    try {
      await prisma.projectCode.create({
        data: {
          project_id: newProjId,
          code_hash: codeHash,
          expires_at: code.expires_at ? new Date(code.expires_at) : new Date(Date.now() + 365*24*60*60*1000),
          issued_by: issuer.id,
          used_by_student_id: code.used_by ? (userIdMap[Number(code.used_by)] || null) : null,
          used_at: code.used_at ? new Date(code.used_at) : null,
        }
      });
      codesCreated++;
    } catch (err) {
      codesSkipped++;
    }
  }
  console.log(`  Creados: ${codesCreated}, Omitidos: ${codesSkipped}`);

  // ============================================================
  // RESUMEN FINAL
  // ============================================================
  const [
    totalOrgs, totalUsers, totalStudents, totalProjects, totalEnrollments
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.student.count(),
    prisma.project.count(),
    prisma.enrollment.count(),
  ]);

  const withCarrera = await prisma.student.count({ where: { carrera: { not: null } } });

  console.log('\n=== RESUMEN FINAL EN secure_fair_db ===');
  console.log(`  Organizaciones: ${totalOrgs}`);
  console.log(`  Usuarios:       ${totalUsers}`);
  console.log(`  Estudiantes:    ${totalStudents} (con carrera: ${withCarrera})`);
  console.log(`  Proyectos:      ${totalProjects}`);
  console.log(`  Inscripciones:  ${totalEnrollments}`);

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  const becario = await prisma.user.findFirst({ where: { role: 'becario' } });
  console.log('\n=== CREDENCIALES ===');
  console.log(`  ADMIN:   username="${admin?.username}" | email="${admin?.email}" | pass="${admin?.password_hash}"`);
  console.log(`  BECARIO: username="${becario?.username}" | email="${becario?.email}" | pass="${becario?.password_hash}"`);

  await oldDb.end();
  console.log('\n✅ MIGRACIÓN COMPLETA');
}

function mapRole(tipo) {
  if (!tipo) return 'student';
  const t = tipo.toLowerCase();
  if (t === 'admin') return 'admin';
  if (t === 'osf' || t === 'socio formador' || t === 'socio') return 'socio';
  if (t === 'becario') return 'becario';
  return 'student'; // Alumno, Estudiante, student
}

fullMigration().catch(console.error).finally(() => prisma.$disconnect());
