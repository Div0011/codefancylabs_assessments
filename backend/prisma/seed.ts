import { PrismaClient, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  // Clear tables in reverse dependency order
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.teamMember.deleteMany({});

  console.log('Seeding team members...');
  const memberAlice = await prisma.teamMember.create({
    data: {
      name: 'Alice Developer',
      email: 'alice@codefancylab.com',
      role: 'Frontend Engineer',
    },
  });

  const memberBob = await prisma.teamMember.create({
    data: {
      name: 'Bob Designer',
      email: 'bob@codefancylab.com',
      role: 'UI/UX Designer',
    },
  });

  const memberCharlie = await prisma.teamMember.create({
    data: {
      name: 'Charlie Manager',
      email: 'charlie@codefancylab.com',
      role: 'Project Manager',
    },
  });

  console.log('Seeding clients...');
  const clientAcme = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      company: 'Acme Corp',
    },
  });

  const clientGlobex = await prisma.client.create({
    data: {
      name: 'Globex Industries',
      email: 'info@globex.co',
      company: 'Globex Inc',
    },
  });

  const clientInitech = await prisma.client.create({
    data: {
      name: 'Initech Corporation',
      email: 'admin@initech.net',
      company: 'Initech',
    },
  });

  console.log('Seeding projects...');
  const projectWeb = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform Rebuild',
      description: 'Upgrading the legacy core storefront to Next.js and high-performance serverless endpoints.',
      status: ProjectStatus.ACTIVE,
      clientId: clientAcme.id,
    },
  });

  const projectApp = await prisma.project.create({
    data: {
      name: 'Mobile App Design System',
      description: 'Creating a unified design system and Figma UI Kit for cross-platform iOS and Android apps.',
      status: ProjectStatus.PLANNED,
      clientId: clientGlobex.id,
    },
  });

  const projectOps = await prisma.project.create({
    data: {
      name: 'Internal Operations Dashboard',
      description: 'Custom portal to manage internal employee allocation, payroll reporting, and asset scheduling.',
      status: ProjectStatus.ON_HOLD,
      clientId: clientInitech.id,
    },
  });

  const projectCompleted = await prisma.project.create({
    data: {
      name: 'Website Migration to Cloudfront',
      description: 'Migrating legacy Wordpress hosting to AWS Cloudfront static hosting for higher performance.',
      status: ProjectStatus.COMPLETED,
      clientId: clientAcme.id,
    },
  });

  console.log('Seeding tasks...');
  const now = new Date();
  
  // Calculate relative dates for upcoming and overdue tasks
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);

  const fiveDaysInFuture = new Date(now);
  fiveDaysInFuture.setDate(now.getDate() + 5);

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  // Tasks for projectWeb (Active)
  await prisma.task.create({
    data: {
      title: 'Design API Response Schemas',
      description: 'Draft the request/response payloads for checkout endpoints and submit for architectural review.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: threeDaysAgo,
      projectId: projectWeb.id,
      assigneeId: memberAlice.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Auth Middleware',
      description: 'Integrate JSON Web Token checking and secure routes on NestJS gateway backend.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: threeDaysAgo, // Overdue!
      projectId: projectWeb.id,
      assigneeId: memberAlice.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Draft Product Grid UI',
      description: 'Create responsive grid layouts for inventory display with smooth image loading states.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: tomorrow,
      projectId: projectWeb.id,
      assigneeId: memberBob.id,
    },
  });

  // Tasks for projectApp (Planned)
  await prisma.task.create({
    data: {
      title: 'Setup Brand Guidelines and Typography',
      description: 'Verify matching brand typefaces and colors conform to accessibility guidelines.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      dueDate: fiveDaysInFuture,
      projectId: projectApp.id,
      assigneeId: memberBob.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Draft Component Spec sheets',
      description: 'Document design variables, spacings, states, and guidelines in design doc.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: fiveDaysInFuture,
      projectId: projectApp.id,
      assigneeId: memberCharlie.id,
    },
  });

  // Tasks for projectOps (On Hold)
  await prisma.task.create({
    data: {
      title: 'Review Legal Requirements for Payroll Data',
      description: 'Document data access limitations for compliance audit preparation.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      dueDate: tomorrow,
      projectId: projectOps.id,
      assigneeId: memberCharlie.id,
    },
  });

  // Tasks for projectCompleted (Completed project has only completed tasks)
  await prisma.task.create({
    data: {
      title: 'Export WordPress Database content',
      description: 'Export all posts, pages, and metadata to JSON for migration processing.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      dueDate: threeDaysAgo,
      projectId: projectCompleted.id,
      assigneeId: memberAlice.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Configure CloudFront Cache Policies',
      description: 'Setup CDN cache behavior, error responses, and custom SSL certificate mapping.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: threeDaysAgo,
      projectId: projectCompleted.id,
      assigneeId: memberCharlie.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
