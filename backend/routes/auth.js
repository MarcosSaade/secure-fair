const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fair_key_2026';

// Login - returns full user object with legacy-compatible fields
router.post('/login', async (req, res) => {
  try {
    const { email, password, username, contraseña } = req.body;
    const identifier = email || username;
    const pass = password || contraseña;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: {
        student: true,
        organization: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.password_hash !== pass) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return full legacy-compatible user object so Login.js can work without changes
    const userData = {
      id: user.id,
      id_usuario: user.id,
      email: user.email,
      correo: user.email,
      username: user.username,
      password_hash: user.password_hash,
      contraseña: user.password_hash,
      role: user.role,
      tipo: user.role,
      org_id: user.org_id,
      id_organizacion: user.org_id,
      is_active: user.is_active,
      activo: user.is_active,
      student: user.student,
      organization: user.organization,
      nombre: user.student ? user.student.full_name : (user.organization ? user.organization.name : user.username),
      token
    };

    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Find student by matricula - used by check-in
router.get('/student/:matricula', async (req, res) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        matricula: {
          equals: req.params.matricula.trim().toUpperCase(),
          mode: 'insensitive'
        }
      },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...student,
        id_usuario: student.user_id,
        nombre: student.full_name,
        celular: student.phone,
        correo: student.user?.email,
        username: student.user?.username
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
