
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create sample teacher
  const teacherPassword = await hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Sample Teacher',
      password: teacherPassword,
      role: 'TEACHER',
    },
  })

  // Create sample training documents
  // Using individual create calls instead of createMany
  await prisma.document.create({
    data: {
      title: 'Introduction to Teaching Methods',
      fileUrl: 'https://example.com/sample1.pdf',
      fileSize: 1024 * 1024, // 1MB
      type: 'TRAINING',
    },
  })

  await prisma.document.create({
    data: {
      title: 'Classroom Management Guide',
      fileUrl: 'https://example.com/sample2.pdf',
      fileSize: 2048 * 1024, // 2MB
      type: 'TRAINING',
    },
  })

  // Create sample announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to the New School Year',
      content: 'We are excited to start this new academic year...',
      isGlobal: true,
      userId: admin.id,
    },
  })

  await prisma.announcement.create({
    data: {
      title: 'Teacher Training Workshop',
      content: 'Please join us for the upcoming workshop...',
      isGlobal: true,
      userId: admin.id,
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })