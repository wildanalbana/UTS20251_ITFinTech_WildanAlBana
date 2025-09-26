import 'dotenv/config';
import connect from '../lib/mongodb.js';
import Product from '../models/Product.js';

async function seed() {
  await connect();

  const sample = [
    {
      name: 'Dog Food Premium 5kg',
      category: 'Pet Food',
      price: 250000,
      stock: 20,
      description: 'Makanan anjing premium 5kg dengan nutrisi lengkap'
    },
    {
      name: 'Cat Food Salmon 2kg',
      category: 'Pet Food',
      price: 150000,
      stock: 30,
      description: 'Makanan kucing rasa salmon 2kg'
    },
    {
      name: 'Bird Seed Mix 1kg',
      category: 'Pet Food',
      price: 50000,
      stock: 50,
      description: 'Campuran biji-bijian sehat untuk burung'
    }
  ];

  await Product.deleteMany({});
  await Product.insertMany(sample);
  console.log('✅ Seed done with Pet Food products');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
