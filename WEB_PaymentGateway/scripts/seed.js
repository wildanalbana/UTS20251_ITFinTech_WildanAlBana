// scripts/seed_purchases_with_checkouts.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connect from '../lib/mongodb.js';
import Product from '../models/Product.js';
import User from '../models/Users.js';
import Payment from '../models/Payment.js';
import Checkout from '../models/Checkout.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function randomTimeOnDate(year, month, day) {
  // Use local times but store as Date (UTC)
  const hour = randInt(8, 22);
  const minute = randInt(0, 59);
  const second = randInt(0, 59);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

async function seed() {
  await connect();
  console.log('🚀 Starting seed (users + checkouts + payments)...');

  // Ensure products exist
  let products = await Product.find({});
  if (!products || products.length === 0) {
    console.log('ℹ️ No products found — creating sample products...');
    const sampleProducts = [
      { title: 'Dog Food Premium 5kg', category: 'Pet Food', price: 250000, stock: 20, description: 'Makanan anjing premium 5kg', images: [] },
      { title: 'Cat Food Salmon 2kg', category: 'Pet Food', price: 150000, stock: 30, description: 'Makanan kucing rasa salmon 2kg', images: [] },
      { title: 'Bird Seed Mix 1kg', category: 'Pet Food', price: 50000, stock: 50, description: 'Campuran biji-bijian untuk burung', images: [] },
      { title: 'Dog Toy Ball', category: 'Pet Toy', price: 45000, stock: 100, description: 'Mainan bola untuk anjing', images: [] },
      { title: 'Cat Treats Pack', category: 'Pet Food', price: 30000, stock: 80, description: 'Snack kucing sehat', images: [] }
    ];
    products = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${products.length} sample products.`);
  } else {
    console.log(`ℹ️ Found ${products.length} existing products — will use them.`);
  }

  // Create users
  const NUM_USERS = 20; // >= 15
  const createdUsers = [];

  for (let i = 1; i <= NUM_USERS; i++) {
    // make reasonably unique but readable emails/phones
    const uniqueSuffix = Date.now().toString().slice(-6) + randInt(10,99).toString();
    const email = `user${uniqueSuffix}_${i}@example.com`;
    const phone = `+62812${pad(randInt(1000,9999))}${pad(randInt(1000,9999))}`;
    const name = `User ${i}`;
    const password = `password${i}`;
    const passwordHash = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        passwordHash,
        isAdmin: false,
        phone,
        mfaEnabled: false
      });
      console.log(`➕ Created user: ${email}`);
    } else {
      console.log(`🔁 User exists: ${email}`);
    }
    createdUsers.push({ user, plainPassword: password });
  }

  // Clear (optional) existing checkouts/payments in the 3-month window to avoid duplicates during repeated runs
  const startRange = new Date(Date.UTC(2025, 7, 1)); // Aug 1, 2025 (monthIndex 7)
  const endRange = new Date(Date.UTC(2025, 9, 31, 23, 59, 59)); // Oct 31, 2025
  // WARNING: uncomment these lines if you want to delete previous seeded payments/checkouts in that range
  // await Payment.deleteMany({ createdAt: { $gte: startRange, $lte: endRange } });
  // await Checkout.deleteMany({ createdAt: { $gte: startRange, $lte: endRange } });

  const createdRecords = [];

  // For each user, create multiple purchase-days across Aug-Sep-Oct 2025
  for (const { user } of createdUsers) {
    const purchaseDaysCount = randInt(3, 18); // for variety, 3..18 different days in the 3 months
    const chosenDates = new Set();
    while (chosenDates.size < purchaseDaysCount) {
      const year = 2025;
      const month = randInt(8, 10); // 8..10
      let maxDay = 31;
      if (month === 9) maxDay = 30;
      if (month === 8) maxDay = 31;
      if (month === 10) maxDay = 31;
      const day = randInt(1, maxDay);
      const key = `${year}-${pad(month)}-${pad(day)}`;
      chosenDates.add(key);
    }

    for (const dateKey of chosenDates) {
      const [y, m, d] = dateKey.split('-').map(n => parseInt(n, 10));
      const purchasesThatDay = randInt(1, 3); // how many checkouts user did that day
      for (let p = 0; p < purchasesThatDay; p++) {
        // Build checkout items: 1..3 items per checkout
        const itemsCount = randInt(1, 3);
        const items = [];
        let total = 0;
        for (let it = 0; it < itemsCount; it++) {
          const prod = randomChoice(products);
          const qty = randInt(1, 3);
          const price = prod.price || randInt(20000, 200000);
          items.push({
            product: prod._id,
            name: prod.title,
            qty,
            price
          });
          total += price * qty;
        }

        // create checkout
        const checkoutCreatedAt = randomTimeOnDate(y, m, d);
        const externalId = `CO-${y}${m.toString().padStart(2,'0')}${d.toString().padStart(2,'0')}-${Date.now().toString().slice(-6)}${randInt(10,99)}`;
        const checkoutStatusRand = Math.random();
        // Map payment-related status to checkout status:
        // We'll create a Payment with status; if payment is paid -> Checkout.PAID else PENDING or EXPIRED
        const checkoutStatus = 'PENDING'; // default; will update after creating payment if needed

        const checkoutDoc = {
          externalId,
          items,
          total,
          status: checkoutStatus,
          createdAt: checkoutCreatedAt
        };

        const checkout = await Checkout.create(checkoutDoc);

        // create payment for this checkout
        const paymentStatusRand = Math.random();
        let paymentStatus;
        if (paymentStatusRand < 0.92) paymentStatus = 'paid';
        else if (paymentStatusRand < 0.96) paymentStatus = 'pending';
        else paymentStatus = 'failed';

        // If payment is 'paid', set checkout status to PAID; if failed/expired -> EXPIRED or leave PENDING
        if (paymentStatus === 'paid') {
          checkout.status = 'PAID';
          await checkout.save();
        } else if (paymentStatus === 'failed') {
          checkout.status = 'EXPIRED';
          await checkout.save();
        }

        const paymentDoc = {
          checkout: checkout._id,
          externalId: `PAY-${Date.now().toString().slice(-6)}${randInt(10,99)}`,
          invoiceId: `INV-${checkout.externalId}`,
          amount: total,
          status: paymentStatus,
          invoiceUrl: `https://example.com/invoice/${checkout.externalId}`,
          createdAt: checkoutCreatedAt
        };

        const payment = await Payment.create(paymentDoc);

        createdRecords.push({
          userId: user._id,
          userEmail: user.email,
          checkoutId: checkout._id,
          paymentId: payment._id,
          date: checkoutCreatedAt,
          total,
          status: paymentStatus
        });
      }
    }
  }

  console.log(`✅ Done. Created ${createdUsers.length} users, ${createdRecords.length} checkout+payment pairs.`);
  console.log('Sample (first 10):');
  console.log(createdRecords.slice(0, 10));

  await mongoose.connection.close();
  console.log('🎉 Seeding complete. Connection closed.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
