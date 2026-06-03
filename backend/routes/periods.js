const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /api/periods/active — returns the currently active FairPeriod
router.get('/active', async (req, res) => {
  try {
    const period = await prisma.fairPeriod.findFirst({
      where: { is_active: true },
      orderBy: { starts_at: 'desc' }
    });
    if (!period) {
      // Fallback: return first period
      const first = await prisma.fairPeriod.findFirst({ orderBy: { id: 'asc' } });
      return res.json({ success: true, data: first || { id: 1 } });
    }
    res.json({ success: true, data: period });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/periods — all periods
router.get('/', async (req, res) => {
  try {
    const periods = await prisma.fairPeriod.findMany({ orderBy: { starts_at: 'desc' } });
    res.json({ success: true, data: periods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
