const fs = require('fs');
const path = require('path');
const prisma = require('./prismaClient');

async function updateEnrollments() {
  const content = fs.readFileSync(path.join(__dirname, 'raw_projects.tsv'), 'utf-8');
  const lines = content.split('\n').map(l => l.trim());
  let inBlock = false;
  let updated = 0;

  for (const line of lines) {
    if (line === 'inscripciones') {
      inBlock = true;
      continue;
    }
    if (inBlock && line && !line.startsWith('id_usuario')) {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const userId = parseInt(parts[0], 10);
        const projectId = parseInt(parts[1], 10);
        const inscripcionId = parseInt(parts[2], 10);
        if (!isNaN(userId) && !isNaN(projectId)) {
          try {
            // First find the user's student record
            const student = await prisma.student.findUnique({
              where: { user_id: userId }
            });
            
            if (student) {
              // Check if enrollment exists
              const existing = await prisma.enrollment.findFirst({
                where: { student_id: student.id, project_id: projectId }
              });
              
              if (!existing) {
                // Get current period
                const period = await prisma.fairPeriod.findFirst({ orderBy: { id: 'desc' } });
                await prisma.enrollment.create({
                  data: {
                    student_id: student.id,
                    project_id: projectId,
                    periodo: period ? period.name : 'Ago-Dic 2026',
                    status: 'active'
                  }
                });
                updated++;
              }
            }
          } catch (e) {
            console.error(`Could not create enrollment for user ${userId}:`, e.message);
          }
        }
      }
    }
  }
  console.log(`Created ${updated} missing enrollments.`);
}

updateEnrollments().catch(console.error).finally(() => prisma.$disconnect());
