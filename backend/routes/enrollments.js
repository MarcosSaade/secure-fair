const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Get all enrollments
router.get('/', async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
          include: { user: true }
        },
        project: true
      }
    });
    // Format slightly for frontend backward compatibility
    const formatted = enrollments.map(e => ({
      ...e,
      id_inscripcion: e.id,
      id_proyecto: e.project_id,
      id_usuario: e.student_user_id
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create enrollment
router.post('/', async (req, res) => {
  try {
    const { student_user_id, project_id, period_id } = req.body;
    
    // 1. Determinar el periodo (si no viene, se usa el del proyecto)
    let targetPeriodId = period_id;
    if (!targetPeriodId) {
      const project = await prisma.project.findUnique({ where: { id: Number(project_id) } });
      targetPeriodId = project?.period_id;
    }
    
    if (!targetPeriodId) {
      const firstPeriod = await prisma.fairPeriod.findFirst();
      targetPeriodId = firstPeriod?.id;
    }

    // 2. VALIDACIÓN: ¿Ya tiene proyecto en este periodo?
    const existing = await prisma.enrollment.findFirst({
      where: {
        student_user_id: Number(student_user_id),
        period_id: Number(targetPeriodId)
      }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'El estudiante ya está inscrito en un proyecto para este periodo.' 
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        student_user_id: Number(student_user_id),
        project_id: Number(project_id),
        period_id: Number(targetPeriodId)
      }
    });
    res.json({ success: true, data: enrollment });
  } catch (error) {
    // Unique constraint error check
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'El estudiante ya está inscrito en este periodo.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete enrollment
router.delete('/:id', async (req, res) => {
  try {
    await prisma.enrollment.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true, message: 'Inscripción eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update enrollment (change project assignment)
router.put('/:id', async (req, res) => {
  try {
    const enrollmentId = Number(req.params.id);
    const { project_id } = req.body;

    // Get the current enrollment to find the student
    const currentEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!currentEnrollment) {
      return res.status(404).json({ success: false, message: 'Inscripción no encontrada.' });
    }

    // Get the new project to determine its period
    const newProject = await prisma.project.findUnique({ where: { id: Number(project_id) } });
    if (!newProject) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado.' });
    }

    const newPeriodId = newProject.period_id;

    // VALIDACIÓN DE CONFLICTO DE PERIODO:
    // Si el nuevo periodo es diferente al actual, verificar que el estudiante
    // no tenga ya otro enrollment en ese periodo
    if (newPeriodId && newPeriodId !== currentEnrollment.period_id) {
      const conflictingEnrollment = await prisma.enrollment.findFirst({
        where: {
          student_user_id: currentEnrollment.student_user_id,
          period_id: newPeriodId,
          id: { not: enrollmentId } // excluir el enrollment actual
        },
        include: { project: true, fair_period: true }
      });

      if (conflictingEnrollment) {
        return res.status(400).json({
          success: false,
          message: `El estudiante ya está inscrito en un proyecto del periodo "${conflictingEnrollment.fair_period?.name || newPeriodId}". No puede tener más de un proyecto por periodo.`
        });
      }
    }

    const updateData = { project_id: Number(project_id) };
    if (newProject.period_id) {
      updateData.period_id = newProject.period_id;
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: { fair_period: true, project: true }
    });
    res.json({ success: true, data: { ...enrollment, id_proyecto: enrollment.project_id, periodo: enrollment.fair_period?.name } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register student in a TimeSlot (with capacity limit of 150 per slot)
router.post('/timeslot/:slotId/register', async (req, res) => {
  try {
    const slotId = Number(req.params.slotId);
    const { student_user_id } = req.body;

    if (!student_user_id) {
      return res.status(400).json({ success: false, message: 'Se requiere el ID del estudiante.' });
    }

    // Get the time slot
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: { slot_registrations: true }
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Franja de horario no encontrada.' });
    }

    // Check capacity (default 150 if not set)
    const maxCapacity = slot.capacity || 150;
    const currentCount = slot.slot_registrations.length;

    if (currentCount >= maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Esta franja horaria ha alcanzado su capacidad máxima de ${maxCapacity} estudiantes.`
      });
    }

    // Check if already registered
    const alreadyRegistered = await prisma.slotRegistration.findFirst({
      where: {
        slot_id: slotId,
        student_user_id: Number(student_user_id)
      }
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'El estudiante ya está registrado en esta franja horaria.'
      });
    }

    // Create registration
    const registration = await prisma.slotRegistration.create({
      data: {
        slot_id: slotId,
        student_user_id: Number(student_user_id)
      }
    });

    res.json({
      success: true,
      data: registration,
      remaining: maxCapacity - currentCount - 1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get TimeSlot availability
router.get('/timeslot/:slotId/availability', async (req, res) => {
  try {
    const slotId = Number(req.params.slotId);
    const slot = await prisma.timeSlot.findUnique({
      where: { id: slotId },
      include: { slot_registrations: true }
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Franja de horario no encontrada.' });
    }

    const maxCapacity = slot.capacity || 150;
    const currentCount = slot.slot_registrations.length;
    const available = Math.max(0, maxCapacity - currentCount);

    res.json({
      success: true,
      data: {
        slot_id: slotId,
        capacity: maxCapacity,
        registered: currentCount,
        available,
        is_full: available === 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
