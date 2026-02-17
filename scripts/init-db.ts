import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    // Works & Estate categories
    prisma.category.upsert({
      where: { id: 'cat-electrical' },
      update: {},
      create: {
        id: 'cat-electrical',
        name: 'Electrical Work',
        type: 'WorksAndEstate',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-civil' },
      update: {},
      create: {
        id: 'cat-civil',
        name: 'Civil Work',
        type: 'WorksAndEstate',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-plumbing' },
      update: {},
      create: {
        id: 'cat-plumbing',
        name: 'Plumbing',
        type: 'WorksAndEstate',
      },
    }),
    // IT Helpdesk categories
    prisma.category.upsert({
      where: { id: 'cat-hardware' },
      update: {},
      create: {
        id: 'cat-hardware',
        name: 'Hardware Issues',
        type: 'ITHelpdesk',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-software' },
      update: {},
      create: {
        id: 'cat-software',
        name: 'Software Issues',
        type: 'ITHelpdesk',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-network' },
      update: {},
      create: {
        id: 'cat-network',
        name: 'Network/Internet',
        type: 'ITHelpdesk',
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)
  console.log('🌱 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
