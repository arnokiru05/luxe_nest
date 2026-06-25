const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  console.log('Clearing old auto-parts data...');
  // Must delete OrderItems first due to FK constraints, then Orders, then Products, then Categories
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('Old data cleared.');
  await prisma.$disconnect();
}

clear().catch(e => { console.error(e); process.exit(1); });
