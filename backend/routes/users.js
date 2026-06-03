const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { student: true, organization: true }
    });
    const mapped = users.map(u => ({
      ...u,
      id_usuario: u.id,
      correo: u.email,
      contrasena: u.password_hash,
      tipo: u.role,
      activo: u.is_active,
      id_organizacion: u.org_id
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const u = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: { student: true, organization: true }
    });
    if (!u) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: { ...u, id_usuario: u.id, correo: u.email, contrasena: u.password_hash, tipo: u.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, username, password, password_hash, role, tipo, org_id, id_organizacion } = req.body;
    const user = await prisma.user.create({
      data: {
        email: email || `${username}@example.com`,
        username: username || null,
        password_hash: password_hash || password || '12345',
        role: role || tipo || 'student',
        org_id: org_id || id_organizacion || null,
        is_active: true
      }
    });
    res.json({ success: true, data: { ...user, id_usuario: user.id, contraseña: user.password_hash, tipo: user.role } });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'El email o username ya existe.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { email, username, password, password_hash, role, tipo, org_id, id_organizacion, is_active, activo } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (password || password_hash) updateData.password_hash = password_hash || password;
    if (role || tipo) updateData.role = role || tipo;
    if (org_id !== undefined || id_organizacion !== undefined) updateData.org_id = org_id || id_organizacion || null;
    if (is_active !== undefined || activo !== undefined) updateData.is_active = is_active !== undefined ? is_active : activo;

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: updateData
    });
    res.json({ success: true, data: { ...user, id_usuario: user.id, contraseña: user.password_hash, tipo: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user (cascade: delete student profile, enrollments, codes, checkins, etc.)
router.delete('/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // 1. Delete all enrollments for this student
    await prisma.enrollment.deleteMany({ where: { student_user_id: userId } });

    // 2. Delete all project codes used by this student
    await prisma.projectCode.updateMany({
      where: { used_by_student_id: userId },
      data: { used_by_student_id: null, used_at: null }
    });

    // 3. Delete slot registrations & their checkins
    const slotRegs = await prisma.slotRegistration.findMany({ where: { student_user_id: userId } });
    const slotRegIds = slotRegs.map(sr => sr.id);
    if (slotRegIds.length > 0) {
      await prisma.checkin.deleteMany({ where: { slot_reg_id: { in: slotRegIds } } });
      await prisma.slotRegistration.deleteMany({ where: { student_user_id: userId } });
    }

    // 4. Delete checkins done BY this user (if admin/becario)
    await prisma.checkin.deleteMany({ where: { checked_by_user_id: userId } });

    // 5. Delete project codes issued by this user
    await prisma.projectCode.deleteMany({ where: { issued_by: userId } });

    // 6. Delete socio-user links
    await prisma.projectSocioUser.deleteMany({ where: { user_id: userId } });

    // 7. Delete student profile
    await prisma.student.deleteMany({ where: { user_id: userId } });

    // 8. Finally delete the user
    await prisma.user.delete({ where: { id: userId } });

    res.json({ success: true, message: 'Usuario y todos sus datos eliminados correctamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
