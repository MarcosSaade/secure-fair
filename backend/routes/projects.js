const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const XLSX = require('xlsx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { organization: true, enrollments: true, fair_period: true }
    });
    const mapped = projects.map(p => ({
      ...p,
      id_proyecto: p.id,
      nombre: p.name,
      nombre_proyecto: p.name,
      id_organizacion: p.org_id,
      descripcion: p.description,
      cupo_estudiantes: p.capacity,
      duracion: p.duration,
      lugar: p.location,
      horas_acreditadas: p.accredited_hours,
      periodo: p.fair_period?.name || null,
      inscritos: p.enrollments.length,
      'Nombre proyecto': p.name,
      '# de inscritos': p.enrollments.length,
      'cupo estudiantes': p.capacity
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get project by id
router.get('/:id', async (req, res) => {
  try {
    const p = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: { organization: true, enrollments: true }
    });
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { ...p, id_proyecto: p.id, nombre_proyecto: p.name, id_organizacion: p.org_id, duracion: p.duration, lugar: p.location, horas_acreditadas: p.accredited_hours } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, nombre, nombre_proyecto, org_id, id_organizacion, capacity, cupo_estudiantes, description, descripcion, duration, duracion, location, lugar, accredited_hours, horas_acreditadas, periodo } = req.body;
    let period;
    if (periodo) {
      period = await prisma.fairPeriod.findFirst({ where: { name: periodo } });
    }
    if (!period) {
      period = await prisma.fairPeriod.findFirst();
    }
    
    const project = await prisma.project.create({
      data: {
        name: name || nombre || nombre_proyecto,
        org_id: Number(org_id || id_organizacion),
        period_id: period.id,
        capacity: Number(capacity || cupo_estudiantes || 30),
        description: description || descripcion || null,
        duration: duration || duracion || null,
        location: location || lugar || null,
        accredited_hours: accredited_hours || horas_acreditadas ? Number(accredited_hours || horas_acreditadas) : null,
        is_active: true
      },
      include: { fair_period: true }
    });
    res.json({ success: true, data: { ...project, id_proyecto: project.id, nombre_proyecto: project.name, id_organizacion: project.org_id, periodo: project.fair_period?.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, nombre, nombre_proyecto, capacity, cupo_estudiantes, description, descripcion, is_active, activo, org_id, id_organizacion, duration, duracion, location, lugar, accredited_hours, horas_acreditadas, periodo } = req.body;
    const updateData = {};
    if (name || nombre || nombre_proyecto) updateData.name = name || nombre || nombre_proyecto;
    if (capacity !== undefined || cupo_estudiantes !== undefined) updateData.capacity = Number(capacity ?? cupo_estudiantes);
    if (description !== undefined || descripcion !== undefined) updateData.description = description || descripcion;
    if (is_active !== undefined || activo !== undefined) updateData.is_active = is_active ?? activo;
    if (org_id !== undefined || id_organizacion !== undefined) updateData.org_id = Number(org_id || id_organizacion);
    if (duration !== undefined || duracion !== undefined) updateData.duration = duration || duracion;
    if (location !== undefined || lugar !== undefined) updateData.location = location || lugar;
    if (accredited_hours !== undefined || horas_acreditadas !== undefined) updateData.accredited_hours = Number(accredited_hours || horas_acreditadas);

    // Resolve periodo name -> period_id
    if (periodo) {
      const fairPeriod = await prisma.fairPeriod.findFirst({ where: { name: periodo } });
      if (fairPeriod) updateData.period_id = fairPeriod.id;
    }

    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      include: { fair_period: true }
    });
    res.json({ success: true, data: { ...project, id_proyecto: project.id, nombre_proyecto: project.name, id_organizacion: project.org_id, periodo: project.fair_period?.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project (cascade: remove enrollments, codes, socio links first)
router.delete('/:id', async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    // 1. Delete enrollments for this project
    await prisma.enrollment.deleteMany({ where: { project_id: projectId } });

    // 2. Delete project codes
    await prisma.projectCode.deleteMany({ where: { project_id: projectId } });

    // 3. Delete socio-user links
    await prisma.projectSocioUser.deleteMany({ where: { project_id: projectId } });

    // 4. Delete the project itself
    await prisma.project.delete({ where: { id: projectId } });

    res.json({ success: true, message: 'Proyecto y sus inscripciones eliminados correctamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Import projects from Excel
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // Column key names (trimmed)
    const COL_ORG    = 'Nombre oficial de la Organización Socio Formadora (OSF) con la que se realizará el Proyecto Solidario ';
    const COL_NAME   = ' Nombre del Proyecto Solidario: \r\n (NOTA: no es el nombre de la OSF ni es el listado de actividades a realizar, ni la clave del CRN, el nombre debe ser atractivo para el estudiante) ';
    const COL_DESC   = 'Objetivo del Proyecto Solidario: \r\n (El objetivo es el cambio deseado que se quiere lograr con el proyecto solidario respecto al problema identificado) ';
    const COL_PLACE  = 'Lugar de trabajo: \r\nColoca la dirección en donde trabajará el estudiantado: ';
    const COL_CAP    = 'Cupo de estudiantes: Colocar el número de estudiantes que pueden participar en la experiencia (como recomendación no manejar menos de 10 participantes por grupo) ';
    const COL_DUR    = 'Duración de la experiencia: ';
    const COL_HOURS  = 'Horas máximas que el estudiante puede acreditar dependiendo de su desempeño: ';

    const orgs = await prisma.organization.findMany();
    const periods = await prisma.fairPeriod.findMany();
    const PERIODO_NAMES = ['Invierno', 'Verano', 'Ago-Dic', 'Ene-Jul'];
    const periodMap = {};
    PERIODO_NAMES.forEach(n => {
      const found = periods.find(p => p.name === n);
      if (found) periodMap[n] = found.id;
    });
    const fallbackPeriod = periods.find(p => PERIODO_NAMES.includes(p.name)) || periods[0];

    let created = 0;
    let orgsCreated = 0;
    let skipped = 0;
    const errors = [];

    // Track newly created orgs in this session to avoid duplicates
    const sessionOrgs = [...orgs];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const orgName = (row[COL_ORG] || '').trim();
      const projName = (row[COL_NAME] || '').trim();
      if (!projName) { skipped++; continue; }

      // Find org by name similarity (including session orgs)
      let org = sessionOrgs.find(o => {
        const oName = (o.name || o.nombre_osf || '').toLowerCase();
        const searchName = orgName.toLowerCase();
        return oName === searchName || oName.includes(searchName.slice(0, 20)) || searchName.includes(oName.slice(0, 20));
      });

      // If still not found and we have a name, create it
      if (!org && orgName) {
        try {
          org = await prisma.organization.create({
            data: {
              name: orgName,
              nombre_osf: orgName,
              is_active: true
            }
          });
          sessionOrgs.push(org);
          orgsCreated++;
        } catch (e) {
          errors.push(`Fila ${i+2}: No se pudo crear la organización "${orgName}": ${e.message}`);
          skipped++;
          continue;
        }
      }

      if (!org) {
        errors.push(`Fila ${i+2}: Organización faltante y no pudo ser creada.`);
        skipped++;
        continue;
      }

      // Parse hours
      const hoursRaw = String(row[COL_HOURS] || '').replace(/[^0-9]/g, '');
      const hours = hoursRaw ? parseInt(hoursRaw, 10) : null;

      // Assign period deterministically
      const pName = PERIODO_NAMES[i % PERIODO_NAMES.length];
      const period_id = periodMap[pName] || fallbackPeriod?.id;

      // Check if this project already exists for this org (prevent re-import duplicates)
      const existingProj = await prisma.project.findFirst({
        where: {
          org_id: org.id,
          name: { equals: projName, mode: 'insensitive' }
        }
      });

      if (existingProj) {
        skipped++;
        continue; // Skip duplicates silently
      }

      try {
        await prisma.project.create({
          data: {
            name: projName,
            org_id: org.id,
            period_id,
            capacity: Number(row[COL_CAP] || 15),
            description: row[COL_DESC] || null,
            location: row[COL_PLACE] || null,
            duration: row[COL_DUR] || null,
            accredited_hours: hours,
            is_active: true,
          }
        });
        created++;
      } catch (e) {
        errors.push(`Fila ${i+2}: ${e.message}`);
        skipped++;
      }
    }

    res.json({ success: true, created, orgsCreated, skipped, errors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
