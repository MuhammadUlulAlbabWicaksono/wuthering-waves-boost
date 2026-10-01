import prisma from './lib/prisma';
async function main() {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  console.log('Orders deleted');
}
main();
