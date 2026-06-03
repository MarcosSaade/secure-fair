const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: { projects: true }
    });
    // Map to legacy format
    const mapped = organizations.map(o => ({
      ...o,
      id_organizacion: o.id,
      nombre: o.name,
      nombre_osf: o.name
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single organization
router.get('/:id', async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: Number(req.params.id) },
      include: { projects: true }
    });
    if (!org) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { ...org, id_organizacion: org.id, nombre_osf: org.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create organization
router.post('/', async (req, res) => {
  try {
    const { name, nombre, nombre_osf } = req.body;
    const org = await prisma.organization.create({
      data: { name: name || nombre || nombre_osf }
    });
    res.json({ success: true, data: { ...org, id_organizacion: org.id, nombre_osf: org.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update organization
router.put('/:id', async (req, res) => {
  try {
    const { name, nombre, nombre_osf } = req.body;
    const org = await prisma.organization.update({
      where: { id: Number(req.params.id) },
      data: { name: name || nombre || nombre_osf }
    });
    res.json({ success: true, data: { ...org, id_organizacion: org.id, nombre_osf: org.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete organization (cascade: delete all projects and their children first)
router.delete('/:id', async (req, res) => {
  try {
    const orgId = Number(req.params.id);

    // Get all projects that belong to this org
    const orgProjects = await prisma.project.findMany({ where: { org_id: orgId } });
    const projectIds = orgProjects.map(p => p.id);

    if (projectIds.length > 0) {
      // 1. Delete all enrollments for these projects
      await prisma.enrollment.deleteMany({ where: { project_id: { in: projectIds } } });

      // 2. Delete project codes
      await prisma.projectCode.deleteMany({ where: { project_id: { in: projectIds } } });

      // 3. Delete socio-user links
      await prisma.projectSocioUser.deleteMany({ where: { project_id: { in: projectIds } } });

      // 4. Delete all projects
      await prisma.project.deleteMany({ where: { org_id: orgId } });
    }

    // 5. Unlink users from this org (don't delete the users, just remove the org reference)
    await prisma.user.updateMany({ where: { org_id: orgId }, data: { org_id: null } });

    // 6. Delete the organization
    await prisma.organization.delete({ where: { id: orgId } });

    res.json({ success: true, message: 'Organización y sus proyectos eliminados correctamente' });
  } catch (error) {
    console.error('Error eliminando organización:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
