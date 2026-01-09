import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding test user with order history...\n');

  // Create or update test user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'demo@esimfly.me' },
    update: {},
    create: {
      email: 'demo@esimfly.me',
      name: 'Demo User',
      password: hashedPassword,
      credits: 1500, // $15.00 in credits
      referralCode: 'DEMO2024',
    },
  });

  console.log(`✓ Test user created/found: ${testUser.email}`);
  console.log(`  Password: demo123`);
  console.log(`  Credits: $${(testUser.credits / 100).toFixed(2)}`);
  console.log(`  Referral Code: ${testUser.referralCode}\n`);

  // Create sample orders with eSIMs
  const orders = [
    {
      country: 'JP',
      countryName: 'Japan',
      planName: 'Japan 5GB - 30 Days',
      dataAmount: '5GB',
      validity: 30,
      total: 1999, // $19.99
      status: 'COMPLETED',
      esim: {
        dataUsed: BigInt(2_400_000_000), // 2.4 GB used
        dataLimit: BigInt(5_000_000_000), // 5 GB
        status: 'ACTIVE',
        daysAgo: 12,
        expiresInDays: 18,
      },
    },
    {
      country: 'TH',
      countryName: 'Thailand',
      planName: 'Thailand 3GB - 15 Days',
      dataAmount: '3GB',
      validity: 15,
      total: 1199, // $11.99
      status: 'COMPLETED',
      promoCode: 'WELCOME10',
      discount: 120, // $1.20 discount
      esim: {
        dataUsed: BigInt(3_000_000_000), // 3 GB (fully used)
        dataLimit: BigInt(3_000_000_000),
        status: 'DEPLETED',
        daysAgo: 45,
        expiresInDays: -30, // Expired 30 days ago
      },
    },
    {
      country: 'FR',
      countryName: 'France',
      planName: 'France 2GB - 7 Days',
      dataAmount: '2GB',
      validity: 7,
      total: 899, // $8.99
      status: 'COMPLETED',
      esim: {
        dataUsed: BigInt(1_800_000_000), // 1.8 GB
        dataLimit: BigInt(2_000_000_000),
        status: 'EXPIRED',
        daysAgo: 60,
        expiresInDays: -53,
      },
    },
    {
      country: 'US',
      countryName: 'United States',
      planName: 'USA 10GB - 30 Days',
      dataAmount: '10GB',
      validity: 30,
      total: 2999, // $29.99
      status: 'COMPLETED',
      esim: {
        dataUsed: BigInt(0), // Not yet activated
        dataLimit: BigInt(10_000_000_000),
        status: 'INACTIVE',
        daysAgo: 2,
        expiresInDays: 28,
      },
    },
    {
      country: 'GB',
      countryName: 'United Kingdom',
      planName: 'UK 5GB - 14 Days',
      dataAmount: '5GB',
      validity: 14,
      total: 1499, // $14.99
      status: 'PAID', // Paid but not yet processed
      esim: null,
    },
  ];

  // Delete existing orders for this user to avoid duplicates
  await prisma.eSim.deleteMany({ where: { userId: testUser.id } });
  await prisma.order.deleteMany({ where: { userId: testUser.id } });
  console.log('✓ Cleared existing orders\n');

  // Create orders
  for (const orderData of orders) {
    const now = new Date();
    const createdAt = new Date(now.getTime() - (orderData.esim?.daysAgo || 0) * 24 * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        status: orderData.status,
        total: orderData.total,
        promoCode: orderData.promoCode || null,
        discount: orderData.discount || 0,
        country: orderData.country,
        countryName: orderData.countryName,
        planName: orderData.planName,
        dataAmount: orderData.dataAmount,
        validity: orderData.validity,
        stripePaymentId: `pi_demo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        createdAt,
      },
    });

    console.log(`✓ Created order: ${orderData.countryName} - ${orderData.dataAmount} ($${(orderData.total / 100).toFixed(2)})`);

    // Create eSIM if order is completed
    if (orderData.esim && orderData.status === 'COMPLETED') {
      const expiresAt = new Date(now.getTime() + orderData.esim.expiresInDays * 24 * 60 * 60 * 1000);
      const activatedAt = orderData.esim.status !== 'INACTIVE'
        ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) // 2 hours after order
        : null;

      // Generate realistic QR code data (base64 encoded)
      const qrData = `LPA:1$esimfly.example.com$${order.id}`;
      const qrCode = Buffer.from(qrData).toString('base64');

      await prisma.eSim.create({
        data: {
          userId: testUser.id,
          orderId: order.id,
          iccid: `8901${Math.random().toString().slice(2, 18)}`,
          qrCode: qrCode,
          activationCode: `LPA:1$esimfly.example.com$${order.id}`,
          status: orderData.esim.status,
          dataUsed: orderData.esim.dataUsed,
          dataLimit: orderData.esim.dataLimit,
          expiresAt,
          activatedAt,
          country: orderData.country,
          countryName: orderData.countryName,
          planName: orderData.planName,
          createdAt,
        },
      });

      const usedGB = Number(orderData.esim.dataUsed) / 1_000_000_000;
      const limitGB = Number(orderData.esim.dataLimit) / 1_000_000_000;
      console.log(`  └─ eSIM: ${orderData.esim.status} (${usedGB.toFixed(1)}/${limitGB}GB used)`);
    }
  }

  // Create promo code if not exists
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discount: 10,
      maxUses: 1000,
      usedCount: 156,
      active: true,
    },
  });
  console.log('\n✓ Promo code WELCOME10 created (10% off)');

  await prisma.promoCode.upsert({
    where: { code: 'SUMMER20' },
    update: {},
    create: {
      code: 'SUMMER20',
      discount: 20,
      maxUses: 500,
      usedCount: 89,
      active: true,
    },
  });
  console.log('✓ Promo code SUMMER20 created (20% off)');

  console.log('\n========================================');
  console.log('Seeding complete!');
  console.log('========================================');
  console.log('\nLogin credentials:');
  console.log('  Email: demo@esimfly.me');
  console.log('  Password: demo123');
  console.log('\nThe test user has:');
  console.log('  - $15.00 in credits');
  console.log('  - 5 orders (various statuses)');
  console.log('  - 4 eSIMs (Active, Inactive, Expired, Depleted)');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
