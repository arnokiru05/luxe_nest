const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CATEGORY_NAMES = [
  "Kitchen Essentials", "Lighting", "Cutlery", "Utensils & Stands",
  "Small Appliances", "Glassware", "Cookware", "Dining"
];

const productTemplates = [
  { name: "High-Speed Pro Blender", category: "Small Appliances", image: "/featured/blender.png", priceRange: [15000, 35000] },
  { name: "Minimalist Cutlery Set", category: "Cutlery",          image: "/featured/cutlery.png", priceRange: [4500,  12000] },
  { name: "Modern Kitchen Pendant Light", category: "Lighting",   image: "/featured/lamp.png",    priceRange: [8000,  22000] },
  { name: "Premium Stand Mixer",    category: "Small Appliances", image: "/featured/blender.png", priceRange: [28000, 60000] },
  { name: "Bamboo Utensil Stand",   category: "Utensils & Stands",image: "/featured/cutlery.png", priceRange: [2500,  6000]  },
  { name: "Sleek LED Desk Lamp",    category: "Lighting",         image: "/featured/lamp.png",    priceRange: [5000,  14000] },
  { name: "Ceramic Knife Set",      category: "Cutlery",          image: "/featured/cutlery.png", priceRange: [3500,  9000]  },
  { name: "Smart Coffee Maker",     category: "Small Appliances", image: "/featured/blender.png", priceRange: [18000, 40000] },
  { name: "Silicone Cooking Utensils", category: "Utensils & Stands", image: "/featured/cutlery.png", priceRange: [4000,  8000] },
  { name: "Brass Chandelier",       category: "Lighting",         image: "/featured/lamp.png",    priceRange: [22000, 45000] },
];

async function main() {
  console.log('Starting Luxe Nest database seeding...');

  // 1. Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@luxenest.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Luxe Nest Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // 2. Wipe any old auto-parts categories/products and re-seed correctly
  // Upsert categories by slug
  const categoryMap = {};
  for (const name of CATEGORY_NAMES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '');
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: {
        name,
        slug,
        description: `Premium ${name} essentials curated for modern living.`,
      }
    });
    categoryMap[name] = category.id;
  }
  console.log("Categories seeded.");

  // 3. Generate 24 luxury home-goods products
  const count = 24;
  let productsSeeded = 0;

  for (let i = 1; i <= count; i++) {
    const template = productTemplates[Math.floor(Math.random() * productTemplates.length)];
    const price = Math.floor(Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]);
    const originalPrice = Math.round(price * (1 + Math.random() * 0.25 + 0.1)); // 10–35% higher
    const rating = Number.parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));
    const inStock = Math.random() > 0.1; // 90% in stock
    const slug = `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}-${Math.random().toString(36).substring(2, 6)}`;

    const exists = await prisma.product.findUnique({ where: { slug } });

    if (!exists) {
      await prisma.product.create({
        data: {
          name: `${template.name} — Edition ${i}`,
          slug,
          price,
          image: template.image,
          categoryId: categoryMap[template.category],
          rating,
          inStock,
          stock: inStock ? Math.floor(Math.random() * 30) + 1 : 0,
          description: `Elevate your home with the ${template.name} — Edition ${i}. Crafted with premium materials and a keen eye for minimalist aesthetics, this piece blends seamlessly into any modern interior.`,
          features: [
            "Premium quality materials",
            "Minimalist design",
            "Easy assembly",
            "1-year warranty",
          ],
          specs: {
            material: ["Stainless Steel", "Bamboo", "Ceramic", "Brass", "Matte Black Aluminum", "Silicone"][Math.floor(Math.random() * 6)],
            colour: ["Silver", "Matte Black", "Rose Gold", "White", "Chrome", "Warm Wood"][Math.floor(Math.random() * 6)],
            warranty: "1 year",
          },
        }
      });
      productsSeeded++;
    }
  }

  console.log(`Successfully seeded ${productsSeeded} luxury home goods products.`);
  console.log('Luxe Nest database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
