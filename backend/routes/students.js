const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        enrollments: {
          include: { 
            project: { include: { organization: true } },
            fair_period: true
          }
        }
      }
    });
    const mapped = students.map(s => ({
      ...s,
      id_usuario: s.user_id,
      nombre: s.full_name,
      apellidos: s.apellidos || '',
      celular: s.phone || '',
      carrera: s.carrera || '',
      hora_registro: s.hora_registro || '',
      correo: s.correo_personal || (s.user ? s.user.email : ''),
      checked_in_at: s.checked_in_at || null,
      username: s.user ? s.user.username : null,
      contrasena: s.user ? s.user.password_hash : null,
      tipo: 'student',
      enrollments: s.enrollments.map(e => ({
        ...e,
        id_proyecto: e.project_id,
        id_organizacion: e.project?.org_id,
        periodo: e.fair_period?.name || null,
        nombre_proyecto: e.project?.name,
        nombre_osf: e.project?.organization?.name,
        duracion: e.project?.duration || null,
        lugar: e.project?.location || null,
        horas_acreditadas: e.project?.accredited_hours || null,
      }))
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student by user_id
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: Number(req.params.id) },
      include: {
        user: true,
        enrollments: {
          include: { 
            project: { include: { organization: true } },
            fair_period: true
          }
        }
      }
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({
      success: true,
      data: {
        ...student,
        id_usuario: student.user_id,
        nombre: student.full_name,
        apellidos: student.apellidos || '',
        celular: student.phone || '',
        carrera: student.carrera || '',
        hora_registro: student.hora_registro || '',
        checked_in_at: student.checked_in_at || null,
        correo: student.correo_personal || student.user?.email || '',
        username: student.user?.username,
        enrollments: student.enrollments.map(e => ({
          ...e,
          id_proyecto: e.project_id,
          id_organizacion: e.project?.org_id,
          nombre_proyecto: e.project?.name,
          nombre_osf: e.project?.organization?.name,
          periodo: e.fair_period?.name || null,
          duracion: e.project?.duration || null,
          lugar: e.project?.location || null,
          horas_acreditadas: e.project?.accredited_hours || null,
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create student (also creates user)
router.post('/', async (req, res) => {
  try {
    const { matricula, full_name, nombre, apellidos, phone, celular, email, username, password, password_hash, role } = req.body;
    const fullName = full_name || `${nombre || ''} ${apellidos || ''}`.trim() || 'Sin Nombre';

    // Create user first
    const user = await prisma.user.create({
      data: {
        email: email || `${matricula}@example.com`,
        username: username || null,
        password_hash: password_hash || password || '12345',
        role: role || 'student',
        is_active: true
      }
    });

    const student = await prisma.student.create({
      data: {
        user_id: user.id,
        matricula,
        full_name: fullName,
        phone: phone || celular || null
      }
    });
    res.json({ success: true, data: { ...student, id_usuario: user.id, username: user.username, contraseña: user.password_hash } });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'La matrícula o email ya existe.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student (or create profile if it doesn't exist yet for this user)
router.put('/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { matricula, full_name, nombre, apellidos, phone, celular, carrera, hora_registro, correo } = req.body;
    const fullName = full_name || (`${nombre || ''} ${apellidos || ''}`.trim()) || undefined;

    const existing = await prisma.student.findUnique({ where: { user_id: userId } });

    let student;
    if (existing) {
      const updateData = {};
      if (fullName) updateData.full_name = fullName;
      if (matricula) updateData.matricula = matricula;
      if (phone || celular) updateData.phone = phone || celular;
      if (carrera !== undefined) updateData.carrera = carrera;
      if (apellidos !== undefined) updateData.apellidos = apellidos;
      if (hora_registro !== undefined) updateData.hora_registro = hora_registro;
      if (req.body.checked_in_at !== undefined) updateData.checked_in_at = req.body.checked_in_at;
      if (correo !== undefined) updateData.correo_personal = correo;
      student = await prisma.student.update({ where: { user_id: userId }, data: updateData });
    } else {
      if (!matricula) {
        return res.status(400).json({ success: false, message: 'La matrícula es requerida para crear el perfil.' });
      }
      student = await prisma.student.create({
        data: {
          user_id: userId,
          matricula,
          full_name: fullName || 'Sin nombre',
          phone: phone || celular || null,
          carrera: carrera || null,
          apellidos: apellidos || null,
          hora_registro: hora_registro || null,
          correo_personal: correo || null,
        }
      });
    }
    res.json({ success: true, data: { ...student, id_usuario: student.user_id, nombre: student.full_name, celular: student.phone, carrera: student.carrera, apellidos: student.apellidos, checked_in_at: student.checked_in_at } });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'La matrícula ya existe en otra cuenta.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
