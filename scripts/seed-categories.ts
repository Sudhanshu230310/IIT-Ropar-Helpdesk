import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with categories...');

  const categories = [
    { name: 'Infrastructure' },
    { name: 'Academics' },
    { name: 'Hostel' },
    { name: 'Dining Hall' },
    { name: 'IT Support' },
    { name: 'Security' },
    { name: 'Maintenance' },
    { name: 'Library' },
    { name: 'Sports' },
    { name: 'Others' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`Created/verified category: ${category.name}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
