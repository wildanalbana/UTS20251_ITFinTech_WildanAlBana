// scripts/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connect from '../lib/mongodb.js';
import Product from '../models/Product.js';
import User from '../models/Users.js';

async function seed() {
  await connect();

  console.log('🚀 Seeding database...');

  // ==== 1️⃣ Seed Admin User ====
  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Administrator',
      email: adminEmail,
      passwordHash,
      isAdmin: true,
      phone: '+6281234567890',
      mfaEnabled: false
    });
    console.log(`✅ Admin user created:
Email: ${adminEmail}
Password: admin123`);
  } else {
    console.log('ℹ️ Admin user already exists, skipping user creation.');
  }

  // ==== 2️⃣ Seed Products (dengan images) ====
  // NOTE: images menggunakan URL placeholder dari Unsplash / source.unsplash.com.
  // Jika ingin gambar lokal, replace URL dengan path di folder /public/images/...
  const sample = [
    {
      title: 'Dog Food Premium 5kg',
      category: 'Pet Food',
      price: 250000,
      stock: 20,
      description: 'Makanan anjing premium 5kg dengan nutrisi lengkap',
      images: [
        // generic dog food image
        'https://images.unsplash.com/photo-1601758123927-4c0f0d2e2b63?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a8b6b9c9b6c4d5e6f7a8b9c0d1e2f3a',
        'https://images.unsplash.com/photo-1556228453-18e7d6df2b2a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'
      ]
    },
    {
      title: 'Cat Food Salmon 2kg',
      category: 'Pet Food',
      price: 150000,
      stock: 30,
      description: 'Makanan kucing rasa salmon 2kg',
      images: [
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
      ]
    },
    {
      title: 'Bird Seed Mix 1kg',
      category: 'Pet Food',
      price: 50000,
      stock: 50,
      description: 'Campuran biji-bijian sehat untuk burung',
      images: [
        'https://images.unsplash.com/photo-1517866958764-88e0d1b6b6d9?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
        'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
      ]
    }
  ];

  // clear existing products (be careful in production)
  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log('✅ Seed done with Pet Food products (with images)');

  // ==== 3️⃣ Done ====
  await mongoose.connection.close();
  console.log('🎉 Database seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
