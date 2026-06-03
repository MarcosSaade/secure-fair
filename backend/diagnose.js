const prisma = require('./prismaClient');
async function diagnose() {
  // Check a sample project with full relations
  const proj = await prisma.project.findFirst({
    include: { organization: true, fair_period: true, enrollments: true }
  });
  console.log('=== SAMPLE PROJECT ===');
  console.log(JSON.stringify({
    id: proj.id,
    name: proj.name,
    org_id: proj.org_id,
    org_name: proj.organization?.name,
    period_id: proj.period_id,
    period_name: proj.fair_period?.name,
    duration: proj.duration,
    location: proj.location,
    accredited_hours: proj.accredited_hours,
    capacity: proj.capacity,
    enrollments_count: proj.enrollments?.length
  }, null, 2));

  // Check a sample enrollment
  const enrollment = await prisma.enrollment.findFirst({
    include: { project: { include: { organization: true, fair_period: true } }, fair_period: true, student: true }
  });
  console.log('\n=== SAMPLE ENROLLMENT ===');
  console.log(JSON.stringify({
    id: enrollment?.id,
    period_id: enrollment?.period_id,
    period_name: enrollment?.fair_period?.name,
    project_id: enrollment?.project_id,
    project_name: enrollment?.project?.name,
    project_period_name: enrollment?.project?.fair_period?.name,
    student_user_id: enrollment?.student_user_id,
  }, null, 2));

  // How many projects have period_id null?
  const nullPeriod = await prisma.project.count({ where: { period_id: null }});
  const total = await prisma.project.count();
  console.log(`\n=== PROJECTS WITH NO period_id: ${nullPeriod}/${total} ===`);
}
diagnose().catch(console.error).finally(() => prisma.$disconnect());
