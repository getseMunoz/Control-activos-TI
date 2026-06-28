import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en tu .env antes de ejecutar el seed.',
    )
  }

  // Ubicación inicial
  const existing = await prisma.location.findFirst({ where: { name: 'Corporativo' } })
  const location =
    existing ??
    (await prisma.location.create({
      data: { name: 'Corporativo', description: 'Sede corporativa principal' },
    }))
  console.log(`✓ Ubicación: ${location.name}`)

  // Usuario administrador (upsert por email único)
  const passwordHash = await hash(password, 10)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: 'Administrador',
      lastName: 'TI',
      role: 'admin_ti',
      locationId: location.id,
    },
  })
  console.log(`✓ Administrador: ${admin.email} (${admin.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
