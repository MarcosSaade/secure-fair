const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const crypto = require('crypto');

// Get all codes for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const codes = await prisma.projectCode.findMany({
      where: { project_id: Number(req.params.projectId) }
    });
    res.json({ success: true, data: codes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate a new code for a project
router.post('/generate', async (req, res) => {
  try {
    const { project_id, issued_by, expires_in_hours = 1 } = req.body;
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const expiresAt = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000);
    const code_hash = crypto.createHash('sha256').update(code).digest('hex');

    const newCode = await prisma.projectCode.create({
      data: {
        project_id: Number(project_id),
        code_hash,
        expires_at: expiresAt,
        issued_by: Number(issued_by) || 1
      }
    });

    // Return the plaintext code (not stored, only hash stored)
    res.json({ success: true, data: { ...newCode, code, is_used: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Validate a code
router.post('/validate', async (req, res) => {
  try {
    const { code, student_user_id } = req.body;
    
    const code_hash = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
    const codeRecord = await prisma.projectCode.findUnique({
      where: { code_hash },
      include: { project: true }
    });

    if (!codeRecord) {
      return res.json({ success: false, message: 'Código no válido o no existe.' });
    }

    if (codeRecord.used_by_student_id) {
      return res.json({ success: false, message: 'Este código ya ha sido utilizado.' });
    }

    if (new Date(codeRecord.expires_at) < new Date()) {
      return res.json({ success: false, message: 'El código ha expirado.' });
    }

    // Mark as used if student_user_id provided
    if (student_user_id) {
      await prisma.projectCode.update({
        where: { id: codeRecord.id },
        data: {
          used_by_student_id: Number(student_user_id),
          used_at: new Date()
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Código válido',
      data: { 
        project: codeRecord.project,
        code_id: codeRecord.id 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
