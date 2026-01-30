import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@succession.com'
  
  
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      name: 'Admin User'
    },
    create: {
        email,
        name: 'Admin User',
        role: 'ADMIN',
        phone: '1234567890'
    }
  })

  console.log('Admin user ready:', admin)
  console.log('Use this email to login:', email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
