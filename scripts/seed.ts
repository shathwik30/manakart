import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { randomUUID } from "crypto";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

function createId() {
  return randomUUID();
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Data Definitions ───

const PARENT_CATEGORIES = [
  { name: "Electronics", icon: "Smartphone", position: 1, children: ["Mobiles", "Laptops", "Audio", "Cameras"] },
  { name: "Fashion", icon: "Shirt", position: 2, children: ["Men", "Women", "Kids", "Footwear"] },
  { name: "Home & Kitchen", icon: "Home", position: 3, children: ["Furniture", "Appliances", "Decor", "Storage"] },
  { name: "Beauty & Personal Care", icon: "Sparkles", position: 4, children: ["Skincare", "Haircare", "Makeup", "Fragrances"] },
  { name: "Sports & Fitness", icon: "Dumbbell", position: 5, children: ["Gym Equipment", "Sportswear", "Outdoor", "Yoga"] },
  { name: "Books & Stationery", icon: "BookOpen", position: 6, children: ["Fiction", "Non-Fiction", "Office Supplies", "Art Supplies"] },
  { name: "Toys & Games", icon: "Gamepad2", position: 7, children: ["Board Games", "Action Figures", "Educational", "Outdoor Play"] },
  { name: "Grocery & Essentials", icon: "ShoppingBasket", position: 8, children: ["Snacks", "Beverages", "Cleaning", "Personal Hygiene"] },
];

const BRAND_NAMES = ["Samsung", "Nike", "boAt", "Prestige", "Lakme", "Puma", "Classmate", "Funskool", "Tata", "HP"];

interface ProductDef {
  title: string;
  category: string; // subcategory name
  brand: string;
  basePrice: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  isFeatured: boolean;
  description: string;
}

const PRODUCTS: ProductDef[] = [
  // Electronics — Mobiles
  { title: "Samsung Galaxy M34 5G (6GB/128GB)", category: "Mobiles", brand: "Samsung", basePrice: 1499900, comparePrice: 1999900, stock: 50, sku: "EL-MOB-001", isFeatured: true, description: "Powerful 5G smartphone with 6000mAh battery, 50MP triple camera, and Super AMOLED display. Perfect for all-day usage." },
  { title: "Samsung Galaxy A15 4G (4GB/64GB)", category: "Mobiles", brand: "Samsung", basePrice: 1099900, comparePrice: 1299900, stock: 80, sku: "EL-MOB-002", isFeatured: false, description: "Budget-friendly Samsung phone with 50MP camera, 5000mAh battery, and smooth 90Hz display." },
  // Electronics — Laptops
  { title: "HP 15s Ryzen 5 Laptop (8GB/512GB SSD)", category: "Laptops", brand: "HP", basePrice: 4299900, comparePrice: 5299900, stock: 25, sku: "EL-LAP-001", isFeatured: true, description: "Thin and light laptop with AMD Ryzen 5 processor, 15.6-inch Full HD display, and fast SSD storage." },
  { title: "HP 14s Intel i3 Laptop (8GB/256GB SSD)", category: "Laptops", brand: "HP", basePrice: 3299900, comparePrice: 3999900, stock: 30, sku: "EL-LAP-002", isFeatured: false, description: "Compact 14-inch laptop ideal for students and everyday computing with Intel Core i3 processor." },
  // Electronics — Audio
  { title: "boAt Rockerz 450 Wireless Headphones", category: "Audio", brand: "boAt", basePrice: 149900, comparePrice: 299900, stock: 150, sku: "EL-AUD-001", isFeatured: true, description: "Premium wireless headphones with 40mm drivers, 15-hour battery life, and padded ear cushions for comfort." },
  { title: "boAt Airdopes 141 TWS Earbuds", category: "Audio", brand: "boAt", basePrice: 109900, comparePrice: 199900, stock: 200, sku: "EL-AUD-002", isFeatured: false, description: "True wireless earbuds with 42-hour total playtime, low latency mode, and IPX4 water resistance." },
  // Electronics — Cameras
  { title: "Samsung Galaxy Buds FE with ANC", category: "Cameras", brand: "Samsung", basePrice: 599900, comparePrice: 699900, stock: 40, sku: "EL-CAM-001", isFeatured: false, description: "Premium earbuds with Active Noise Cancellation, 360 Audio, and 30-hour battery with case." },

  // Fashion — Men
  { title: "Nike Dri-FIT Men's Training T-Shirt", category: "Men", brand: "Nike", basePrice: 149900, comparePrice: 199900, stock: 100, sku: "FA-MEN-001", isFeatured: true, description: "Moisture-wicking training t-shirt with Dri-FIT technology. Lightweight and breathable for intense workouts." },
  { title: "Puma Men's Slim Fit Joggers", category: "Men", brand: "Puma", basePrice: 179900, comparePrice: 249900, stock: 80, sku: "FA-MEN-002", isFeatured: false, description: "Comfortable slim fit joggers with elastic waistband and zippered pockets. Perfect for casual and gym wear." },
  // Fashion — Women
  { title: "Nike Women's Air Max Running Shoes", category: "Women", brand: "Nike", basePrice: 799900, comparePrice: 999900, stock: 35, sku: "FA-WOM-001", isFeatured: true, description: "Iconic Air Max cushioning for all-day comfort. Lightweight mesh upper with responsive foam sole." },
  { title: "Puma Women's Training Leggings", category: "Women", brand: "Puma", basePrice: 199900, comparePrice: 299900, stock: 60, sku: "FA-WOM-002", isFeatured: false, description: "High-waist training leggings with 4-way stretch fabric and moisture-wicking dryCELL technology." },
  // Fashion — Kids
  { title: "Nike Kids' Everyday Cushioned Socks (3 Pack)", category: "Kids", brand: "Nike", basePrice: 59900, stock: 120, sku: "FA-KID-001", isFeatured: false, description: "Soft cotton blend socks with arch support and cushioned sole. Pack of 3 in assorted colours." },
  // Fashion — Footwear
  { title: "Puma Smash v2 Unisex Sneakers", category: "Footwear", brand: "Puma", basePrice: 249900, comparePrice: 399900, stock: 70, sku: "FA-FTW-001", isFeatured: true, description: "Classic court-style sneakers with soft leather upper, rubber outsole, and comfortable SoftFoam+ insole." },

  // Home & Kitchen — Furniture
  { title: "Tata Nilkamal Plastic Armchair (Brown)", category: "Furniture", brand: "Tata", basePrice: 149900, comparePrice: 199900, stock: 40, sku: "HK-FUR-001", isFeatured: false, description: "Sturdy and weather-resistant plastic armchair suitable for indoor and outdoor use. Easy to clean and maintain." },
  // Home & Kitchen — Appliances
  { title: "Prestige PIDM 3.0 Induction Cooktop", category: "Appliances", brand: "Prestige", basePrice: 219900, comparePrice: 299900, stock: 60, sku: "HK-APP-001", isFeatured: true, description: "1600W induction cooktop with push-button control, anti-magnetic wall technology, and Indian menu options." },
  { title: "Prestige Popular Pressure Cooker 5L", category: "Appliances", brand: "Prestige", basePrice: 179900, comparePrice: 239900, stock: 90, sku: "HK-APP-002", isFeatured: false, description: "India's favourite aluminium pressure cooker with metallic safety plug and precision weight valve." },
  // Home & Kitchen — Decor
  { title: "Tata Tanishq Brass Diya Set (Pack of 4)", category: "Decor", brand: "Tata", basePrice: 89900, comparePrice: 129900, stock: 100, sku: "HK-DEC-001", isFeatured: false, description: "Handcrafted brass diyas perfect for festive decoration and daily puja. Set of 4 with intricate designs." },
  // Home & Kitchen — Storage
  { title: "Prestige Clean Home Vacuum Cleaner 1.5L", category: "Storage", brand: "Prestige", basePrice: 399900, comparePrice: 499900, stock: 30, sku: "HK-STO-001", isFeatured: false, description: "Powerful 1400W vacuum cleaner with HEPA filter, multiple attachments, and 1.5L dust capacity." },

  // Beauty — Skincare
  { title: "Lakme Absolute Perfect Radiance Skin Cream", category: "Skincare", brand: "Lakme", basePrice: 39900, comparePrice: 49900, stock: 150, sku: "BE-SKN-001", isFeatured: true, description: "Brightening day cream with SPF 30 PA++ that gives radiant, even-toned skin. Suitable for all skin types." },
  { title: "Lakme Sun Expert Ultra Matte SPF 50 Lotion", category: "Skincare", brand: "Lakme", basePrice: 29900, comparePrice: 39900, stock: 180, sku: "BE-SKN-002", isFeatured: false, description: "Lightweight matte sunscreen lotion with broad-spectrum SPF 50 protection. Non-greasy formula." },
  // Beauty — Haircare
  { title: "Tata Harper Revitalizing Hair Oil (200ml)", category: "Haircare", brand: "Tata", basePrice: 24900, comparePrice: 34900, stock: 200, sku: "BE-HAR-001", isFeatured: false, description: "Natural hair oil enriched with coconut, amla, and brahmi extracts for strong, shiny, and healthy hair." },
  // Beauty — Makeup
  { title: "Lakme 9 to 5 Primer + Matte Lipstick", category: "Makeup", brand: "Lakme", basePrice: 34900, stock: 120, sku: "BE-MAK-001", isFeatured: false, description: "Long-lasting matte lipstick with built-in primer for smooth application. Available in 30+ shades." },
  // Beauty — Fragrances
  { title: "Lakme Enrich Satin Lip Color", category: "Fragrances", brand: "Lakme", basePrice: 19900, stock: 100, sku: "BE-FRG-001", isFeatured: false, description: "Enriched with olive extracts for smooth, satin-finish colour. Keeps lips moisturised all day." },

  // Sports — Gym Equipment
  { title: "Puma Training Resistance Bands Set", category: "Gym Equipment", brand: "Puma", basePrice: 99900, comparePrice: 149900, stock: 80, sku: "SF-GYM-001", isFeatured: false, description: "Set of 3 resistance bands with different tension levels for strength training, stretching, and rehabilitation." },
  { title: "Nike Fundamental Speed Rope", category: "Gym Equipment", brand: "Nike", basePrice: 79900, comparePrice: 99900, stock: 90, sku: "SF-GYM-002", isFeatured: false, description: "Adjustable-length speed rope with ball bearing handles for smooth, fast rotation during cardio workouts." },
  // Sports — Sportswear
  { title: "Nike Pro Men's Compression Shorts", category: "Sportswear", brand: "Nike", basePrice: 129900, comparePrice: 179900, stock: 60, sku: "SF-SPW-001", isFeatured: false, description: "Tight-fit compression shorts with Dri-FIT technology for support and ventilation during training." },
  // Sports — Outdoor
  { title: "Puma Unisex Outdoor Backpack (35L)", category: "Outdoor", brand: "Puma", basePrice: 199900, comparePrice: 299900, stock: 45, sku: "SF-OUT-001", isFeatured: true, description: "Durable 35-litre backpack with multiple compartments, padded laptop sleeve, and water-resistant fabric." },
  // Sports — Yoga
  { title: "Nike Fundamental Yoga Mat (3mm)", category: "Yoga", brand: "Nike", basePrice: 179900, comparePrice: 249900, stock: 55, sku: "SF-YOG-001", isFeatured: false, description: "Lightweight 3mm yoga mat with textured surface for grip, foam cushioning, and easy carry strap." },

  // Books — Fiction
  { title: "Classmate Notebook Premium Ruled (Pack of 6)", category: "Fiction", brand: "Classmate", basePrice: 29900, stock: 300, sku: "BS-FIC-001", isFeatured: false, description: "Premium single-line ruled notebooks with 172 pages each. Smooth paper quality ideal for writing." },
  // Books — Non-Fiction
  { title: "Classmate Drawing Book A3 (50 Pages)", category: "Non-Fiction", brand: "Classmate", basePrice: 14900, stock: 200, sku: "BS-NF-001", isFeatured: false, description: "Large A3 size drawing book with thick white pages suitable for sketching, painting, and art projects." },
  // Books — Office Supplies
  { title: "Classmate Pulse Gel Pen (Pack of 10)", category: "Office Supplies", brand: "Classmate", basePrice: 14900, comparePrice: 19900, stock: 250, sku: "BS-OFF-001", isFeatured: false, description: "Smooth gel pens with comfortable rubber grip and 0.5mm tip for neat writing. Pack of 10 blue pens." },
  // Books — Art Supplies
  { title: "Classmate Colour Pencils (24 Shades)", category: "Art Supplies", brand: "Classmate", basePrice: 19900, comparePrice: 24900, stock: 150, sku: "BS-ART-001", isFeatured: false, description: "Premium colour pencils with vibrant pigments and smooth laydown. Break-resistant leads in 24 shades." },

  // Toys — Board Games
  { title: "Funskool Monopoly Classic Board Game", category: "Board Games", brand: "Funskool", basePrice: 49900, comparePrice: 69900, stock: 50, sku: "TG-BRD-001", isFeatured: true, description: "The classic family board game of buying, selling, and trading properties. For 2-6 players, ages 8+." },
  { title: "Funskool Scrabble Original Board Game", category: "Board Games", brand: "Funskool", basePrice: 59900, comparePrice: 79900, stock: 40, sku: "TG-BRD-002", isFeatured: false, description: "Classic word game with premium tiles and rotating board. Build words and score points. Ages 10+." },
  // Toys — Action Figures
  { title: "Funskool Marvel Avengers Action Figure Set", category: "Action Figures", brand: "Funskool", basePrice: 79900, comparePrice: 99900, stock: 35, sku: "TG-ACT-001", isFeatured: false, description: "Set of 4 articulated Marvel Avengers action figures including Iron Man, Captain America, Thor, and Hulk." },
  // Toys — Educational
  { title: "Funskool Play-Doh Fun Factory Set", category: "Educational", brand: "Funskool", basePrice: 44900, comparePrice: 59900, stock: 60, sku: "TG-EDU-001", isFeatured: false, description: "Creative Play-Doh set with extruder, moulds, and 4 cans of compound. Develops fine motor skills." },
  // Toys — Outdoor Play
  { title: "Funskool Cricket Set (Junior)", category: "Outdoor Play", brand: "Funskool", basePrice: 89900, comparePrice: 119900, stock: 45, sku: "TG-OUT-001", isFeatured: false, description: "Complete junior cricket set with bat, ball, stumps, and carry bag. Suitable for ages 5-10." },

  // Grocery — Snacks
  { title: "Tata Sampann Roasted Chana (400g)", category: "Snacks", brand: "Tata", basePrice: 8900, stock: 300, sku: "GR-SNK-001", isFeatured: false, description: "Crunchy roasted chana made from unpolished whole chana dal. High protein, fibre-rich healthy snack." },
  { title: "Tata Soulfull Ragi Bites Choco Fills (250g)", category: "Snacks", brand: "Tata", basePrice: 14900, stock: 200, sku: "GR-SNK-002", isFeatured: false, description: "Tasty chocolate-filled ragi bites — a healthier cereal option for kids with the goodness of ragi." },
  // Grocery — Beverages
  { title: "Tata Gold Premium Tea (500g)", category: "Beverages", brand: "Tata", basePrice: 27900, comparePrice: 32900, stock: 150, sku: "GR-BEV-001", isFeatured: false, description: "Premium blend of Assam and Nilgiri tea leaves for a rich, aromatic cup. India's trusted tea brand." },
  { title: "Tata Sampann Organic Green Tea (25 Bags)", category: "Beverages", brand: "Tata", basePrice: 17900, comparePrice: 22900, stock: 120, sku: "GR-BEV-002", isFeatured: false, description: "100% organic green tea with natural antioxidants. Light and refreshing flavour, 25 staple-free bags." },
  // Grocery — Cleaning
  { title: "Tata Swach Water Purifier Cartridge", category: "Cleaning", brand: "Tata", basePrice: 49900, comparePrice: 59900, stock: 80, sku: "GR-CLN-001", isFeatured: false, description: "Replacement cartridge for Tata Swach water purifier. Removes bacteria and provides safe drinking water." },
  // Grocery — Personal Hygiene
  { title: "Tata 1mg Sanitizer (500ml, Pack of 2)", category: "Personal Hygiene", brand: "Tata", basePrice: 19900, comparePrice: 29900, stock: 200, sku: "GR-PHY-001", isFeatured: false, description: "70% alcohol-based hand sanitizer gel. Kills 99.9% germs. Moisturising formula with aloe vera." },

  // Extra products for variety
  { title: "Samsung 24-inch FHD Monitor (LS24)", category: "Laptops", brand: "Samsung", basePrice: 1099900, comparePrice: 1399900, stock: 20, sku: "EL-LAP-003", isFeatured: false, description: "24-inch Full HD IPS monitor with 75Hz refresh rate, AMD FreeSync, and slim bezel design." },
  { title: "boAt Stone 352 Portable Bluetooth Speaker", category: "Audio", brand: "boAt", basePrice: 149900, comparePrice: 249900, stock: 100, sku: "EL-AUD-003", isFeatured: false, description: "10W portable speaker with IPX5 water resistance, 12-hour playtime, and TWS pairing support." },
  { title: "Nike Academy Football (Size 5)", category: "Outdoor", brand: "Nike", basePrice: 179900, comparePrice: 249900, stock: 40, sku: "SF-OUT-002", isFeatured: false, description: "Machine-stitched football with textured casing for consistent touch and aerodynamic performance." },
  { title: "Prestige Omega Deluxe Non-Stick Tawa", category: "Appliances", brand: "Prestige", basePrice: 74900, comparePrice: 99900, stock: 100, sku: "HK-APP-003", isFeatured: false, description: "Premium non-stick concave tawa with 5-star non-stick coating and heat-resistant handles." },
  { title: "HP DeskJet 2723e All-in-One Printer", category: "Cameras", brand: "HP", basePrice: 549900, comparePrice: 699900, stock: 15, sku: "EL-CAM-002", isFeatured: false, description: "Compact all-in-one printer with wireless printing, scanning, and copying. Supports HP Instant Ink." },
];

const HERO_SLIDES = [
  { title: "Mega Electronics Sale", subtitle: "Up to 60% off on smartphones, laptops & audio", image: "https://picsum.photos/seed/hero-electronics/1920/600", ctaText: "Shop Now", ctaLink: "/category/electronics", position: 1 },
  { title: "Fashion Fiesta", subtitle: "New arrivals from Nike, Puma & more — starting at ₹599", image: "https://picsum.photos/seed/hero-fashion/1920/600", ctaText: "Explore", ctaLink: "/category/fashion", position: 2 },
  { title: "Home Essentials", subtitle: "Everything for your kitchen & home at amazing prices", image: "https://picsum.photos/seed/hero-home/1920/600", ctaText: "Browse", ctaLink: "/category/home-kitchen", position: 3 },
];

const REVIEW_DATA = [
  { productIdx: 0, rating: 5, title: "Best phone in this range", comment: "Amazing battery life and camera quality. Totally worth the price.", userName: "Rahul S." },
  { productIdx: 2, rating: 4, title: "Great laptop for students", comment: "Fast SSD and good build quality. Display could be brighter though.", userName: "Priya M." },
  { productIdx: 4, rating: 5, title: "Incredible sound quality", comment: "Bass is deep, mids are clear. Best headphones under ₹1500.", userName: "Amit K." },
  { productIdx: 7, rating: 4, title: "Comfortable and lightweight", comment: "Perfect for gym sessions. The fabric is breathable and dries quickly.", userName: "Vikram R." },
  { productIdx: 9, rating: 5, title: "Love these shoes!", comment: "Super comfortable for running. Air Max cushioning is amazing.", userName: "Sneha P." },
  { productIdx: 14, rating: 5, title: "Must-have for Indian kitchen", comment: "Heats up fast and energy efficient. Using it daily for 6 months now.", userName: "Meera D." },
  { productIdx: 19, rating: 4, title: "Good moisturizer with SPF", comment: "Lightweight cream that absorbs quickly. SPF protection is a plus.", userName: "Ananya G." },
  { productIdx: 26, rating: 5, title: "Perfect backpack", comment: "Fits my laptop, books, and gym clothes. Very comfortable straps.", userName: "Karthik V." },
  { productIdx: 33, rating: 5, title: "Family game night favourite", comment: "Kids and adults both love it. Brings the whole family together.", userName: "Deepa N." },
  { productIdx: 40, rating: 4, title: "Best tea for daily use", comment: "Rich flavour without being too strong. Great with or without milk.", userName: "Suresh T." },
];

// ─── Seed Function ───

async function seed() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data in reverse FK order
  console.log("🗑️  Clearing existing data...");
  await db.delete(schema.reviews);
  await db.delete(schema.deals);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
  await db.delete(schema.heroContents);
  await db.delete(schema.homepageSections);
  await db.delete(schema.coupons);
  await db.delete(schema.productVariants);
  await db.delete(schema.productOptionValues);
  await db.delete(schema.productOptions);
  await db.delete(schema.products);
  await db.delete(schema.brands);
  // Delete child categories first, then parents
  await db.delete(schema.categories);
  await db.delete(schema.otps);
  await db.delete(schema.addresses);
  await db.delete(schema.users);
  console.log("   Done.\n");

  // ─── Users ───
  console.log("👤 Creating users...");
  const adminId = createId();
  const regularUserId = createId();
  await db.insert(schema.users).values([
    { id: adminId, email: "admin@manakart.com", name: "Admin", phone: "9999999999", role: "ADMIN" },
    { id: regularUserId, email: "user@manakart.com", name: "Test User", phone: "9876543210", role: "USER" },
  ]);
  console.log("   Created admin (admin@manakart.com) and test user.\n");

  // ─── Categories ───
  console.log("📁 Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const parent of PARENT_CATEGORIES) {
    const parentId = createId();
    const parentSlug = slugify(parent.name);
    categoryMap[parent.name] = parentId;
    await db.insert(schema.categories).values({
      id: parentId,
      name: parent.name,
      slug: parentSlug,
      icon: parent.icon,
      image: `https://picsum.photos/seed/cat-${parentSlug}/400/400`,
      showInNav: true,
      position: parent.position,
      isActive: true,
    });
    for (let i = 0; i < parent.children.length; i++) {
      const childName = parent.children[i];
      const childId = createId();
      const childSlug = slugify(childName);
      categoryMap[childName] = childId;
      await db.insert(schema.categories).values({
        id: childId,
        name: childName,
        slug: childSlug,
        icon: parent.icon,
        image: `https://picsum.photos/seed/cat-${childSlug}/400/400`,
        showInNav: false,
        position: i + 1,
        isActive: true,
        parentId,
      });
    }
  }
  console.log(`   Created ${Object.keys(categoryMap).length} categories.\n`);

  // ─── Brands ───
  console.log("🏷️  Creating brands...");
  const brandMap: Record<string, string> = {};
  for (const name of BRAND_NAMES) {
    const id = createId();
    brandMap[name] = id;
    await db.insert(schema.brands).values({
      id,
      name,
      slug: slugify(name),
      logo: `https://picsum.photos/seed/brand-${slugify(name)}/200/200`,
      isActive: true,
    });
  }
  console.log(`   Created ${BRAND_NAMES.length} brands.\n`);

  // ─── Products ───
  console.log("📦 Creating products...");
  const productIds: string[] = [];
  for (const p of PRODUCTS) {
    const id = createId();
    productIds.push(id);
    const slug = slugify(p.title);
    await db.insert(schema.products).values({
      id,
      title: p.title,
      slug,
      description: p.description,
      basePrice: p.basePrice,
      comparePrice: p.comparePrice ?? null,
      images: [
        `https://picsum.photos/seed/${slug}-1/800/800`,
        `https://picsum.photos/seed/${slug}-2/800/800`,
        `https://picsum.photos/seed/${slug}-3/800/800`,
      ],
      stock: p.stock,
      sku: p.sku,
      isFeatured: p.isFeatured,
      isActive: true,
      categoryId: categoryMap[p.category] ?? null,
      brandId: brandMap[p.brand] ?? null,
    });
  }
  console.log(`   Created ${PRODUCTS.length} products.\n`);

  // ─── Variant Products ───
  console.log("🎨 Creating variant products...");

  // --- 1. Nike Dri-FIT T-Shirt (idx 7) → Size + Color ---
  const tshirtIdx = 7;
  const tshirtId = productIds[tshirtIdx];
  const tshirtSizeOpt = createId();
  const tshirtColorOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: tshirtSizeOpt, productId: tshirtId, name: "Size", position: 0 },
    { id: tshirtColorOpt, productId: tshirtId, name: "Color", position: 1 },
  ]);
  const tshirtSizes = ["S", "M", "L", "XL"];
  const tshirtColors = ["Black", "White", "Navy"];
  for (let i = 0; i < tshirtSizes.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: tshirtSizeOpt, value: tshirtSizes[i], position: i });
  }
  for (let i = 0; i < tshirtColors.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: tshirtColorOpt, value: tshirtColors[i], position: i });
  }
  let variantCount = 0;
  let pos = 0;
  for (const size of tshirtSizes) {
    for (const color of tshirtColors) {
      const stock = size === "M" || size === "L" ? 25 : 15;
      await db.insert(schema.productVariants).values({
        id: createId(), productId: tshirtId, price: 149900, comparePrice: 199900, stock,
        sku: `FA-MEN-001-${size}-${color.substring(0, 3).toUpperCase()}`,
        optionValues: [{ optionName: "Size", valueName: size }, { optionName: "Color", valueName: color }],
        isActive: true, position: pos++,
      });
      variantCount++;
    }
  }
  await db.update(schema.products).set({ hasVariants: true, stock: 240 }).where(eq(schema.products.id, tshirtId));

  // --- 2. Nike Women's Air Max (idx 9) → Size ---
  const shoesIdx = 9;
  const shoesId = productIds[shoesIdx];
  const shoesSizeOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: shoesSizeOpt, productId: shoesId, name: "Size", position: 0 },
  ]);
  const shoeSizes = ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"];
  for (let i = 0; i < shoeSizes.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: shoesSizeOpt, value: shoeSizes[i], position: i });
  }
  pos = 0;
  for (const size of shoeSizes) {
    const stock = size === "UK 6" ? 12 : size === "UK 4" || size === "UK 8" ? 5 : 8;
    await db.insert(schema.productVariants).values({
      id: createId(), productId: shoesId, price: 799900, comparePrice: 999900, stock,
      sku: `FA-WOM-001-${size.replace(" ", "")}`,
      optionValues: [{ optionName: "Size", valueName: size }],
      isActive: true, position: pos++,
    });
    variantCount++;
  }
  await db.update(schema.products).set({ hasVariants: true, stock: 38 }).where(eq(schema.products.id, shoesId));

  // --- 3. Samsung Galaxy M34 (idx 0) → Storage + Color ---
  const phoneIdx = 0;
  const phoneId = productIds[phoneIdx];
  const phoneStorageOpt = createId();
  const phoneColorOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: phoneStorageOpt, productId: phoneId, name: "Storage", position: 0 },
    { id: phoneColorOpt, productId: phoneId, name: "Color", position: 1 },
  ]);
  const phoneStorages = ["128GB", "256GB"];
  const phoneColors = ["Midnight Blue", "Electric Green"];
  for (let i = 0; i < phoneStorages.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: phoneStorageOpt, value: phoneStorages[i], position: i });
  }
  for (let i = 0; i < phoneColors.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: phoneColorOpt, value: phoneColors[i], position: i });
  }
  pos = 0;
  const phonePrices: Record<string, number> = { "128GB": 1499900, "256GB": 1799900 };
  const phoneComparePrices: Record<string, number> = { "128GB": 1999900, "256GB": 2299900 };
  for (const storage of phoneStorages) {
    for (const color of phoneColors) {
      await db.insert(schema.productVariants).values({
        id: createId(), productId: phoneId, price: phonePrices[storage], comparePrice: phoneComparePrices[storage], stock: 15,
        sku: `EL-MOB-001-${storage}-${color === "Midnight Blue" ? "BLU" : "GRN"}`,
        optionValues: [{ optionName: "Storage", valueName: storage }, { optionName: "Color", valueName: color }],
        isActive: true, position: pos++,
      });
      variantCount++;
    }
  }
  await db.update(schema.products).set({ hasVariants: true, basePrice: 1499900, stock: 60 }).where(eq(schema.products.id, phoneId));

  // --- 4. Puma Smash v2 Sneakers (idx 11) → Size + Color ---
  const sneakersIdx = 11;
  const sneakersId = productIds[sneakersIdx];
  const sneakersSizeOpt = createId();
  const sneakersColorOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: sneakersSizeOpt, productId: sneakersId, name: "Size", position: 0 },
    { id: sneakersColorOpt, productId: sneakersId, name: "Color", position: 1 },
  ]);
  const sneakerSizes = ["UK 7", "UK 8", "UK 9", "UK 10"];
  const sneakerColors = ["White", "Black"];
  for (let i = 0; i < sneakerSizes.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: sneakersSizeOpt, value: sneakerSizes[i], position: i });
  }
  for (let i = 0; i < sneakerColors.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: sneakersColorOpt, value: sneakerColors[i], position: i });
  }
  pos = 0;
  for (const size of sneakerSizes) {
    for (const color of sneakerColors) {
      await db.insert(schema.productVariants).values({
        id: createId(), productId: sneakersId, price: 249900, comparePrice: 399900, stock: 10,
        sku: `FA-FTW-001-${size.replace(" ", "")}-${color.substring(0, 3).toUpperCase()}`,
        optionValues: [{ optionName: "Size", valueName: size }, { optionName: "Color", valueName: color }],
        isActive: true, position: pos++,
      });
      variantCount++;
    }
  }
  await db.update(schema.products).set({ hasVariants: true, stock: 80 }).where(eq(schema.products.id, sneakersId));

  console.log(`   Created ${variantCount} variants across 4 products.\n`);

  // ─── Hero Content ───
  console.log("🖼️  Creating hero slides...");
  for (const slide of HERO_SLIDES) {
    await db.insert(schema.heroContents).values({
      id: createId(),
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      isActive: true,
      position: slide.position,
    });
  }
  console.log(`   Created ${HERO_SLIDES.length} hero slides.\n`);

  // ─── Deals ───
  console.log("🔥 Creating deals...");
  const dealProductIndices = [0, 4, 9, 14, 33]; // Samsung M34, boAt headphones, Nike shoes, Prestige cooktop, Monopoly
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  for (let i = 0; i < dealProductIndices.length; i++) {
    const idx = dealProductIndices[i];
    const product = PRODUCTS[idx];
    const dealPrice = Math.round(product.basePrice * 0.75); // 25% off
    await db.insert(schema.deals).values({
      id: createId(),
      productId: productIds[idx],
      dealPrice,
      startsAt: now,
      endsAt: thirtyDaysLater,
      isActive: true,
      position: i + 1,
    });
  }
  console.log(`   Created ${dealProductIndices.length} deals.\n`);

  // ─── Coupons ───
  console.log("🎟️  Creating coupons...");
  await db.insert(schema.coupons).values([
    {
      id: createId(),
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      value: 10,
      minOrderValue: 49900, // ₹499
      maxDiscount: 50000, // ₹500
      usageLimit: 1000,
      usedCount: 0,
      expiresAt: thirtyDaysLater,
      isActive: true,
    },
    {
      id: createId(),
      code: "FLAT200",
      discountType: "FLAT",
      value: 20000, // ₹200
      minOrderValue: 99900, // ₹999
      usageLimit: 500,
      usedCount: 0,
      expiresAt: thirtyDaysLater,
      isActive: true,
    },
  ]);
  console.log("   Created 2 coupons (WELCOME10, FLAT200).\n");

  // ─── Reviews ───
  console.log("⭐ Creating reviews...");
  for (const r of REVIEW_DATA) {
    await db.insert(schema.reviews).values({
      id: createId(),
      productId: productIds[r.productIdx],
      userId: regularUserId,
      userName: r.userName,
      title: r.title,
      rating: r.rating,
      comment: r.comment,
      isFeatured: true,
      isApproved: true,
    });
  }
  console.log(`   Created ${REVIEW_DATA.length} reviews.\n`);

  // ─── Homepage Sections ───
  console.log("🏠 Creating homepage sections...");
  await db.insert(schema.homepageSections).values([
    { id: createId(), type: "deals", title: "Deal of the Day", position: 1, isActive: true },
    { id: createId(), type: "categories", title: "Shop by Category", position: 2, isActive: true },
    { id: createId(), type: "featured", title: "Featured Products", position: 3, isActive: true },
    { id: createId(), type: "reviews", title: "What Our Customers Say", position: 4, isActive: true },
  ]);
  console.log("   Created 4 homepage sections.\n");

  console.log("✅ Seed complete! Database populated with:");
  console.log(`   • 2 users (admin + test)`);
  console.log(`   • ${Object.keys(categoryMap).length} categories (${PARENT_CATEGORIES.length} parent + ${Object.keys(categoryMap).length - PARENT_CATEGORIES.length} subcategories)`);
  console.log(`   • ${BRAND_NAMES.length} brands`);
  console.log(`   • ${PRODUCTS.length} products (4 with variants, ${variantCount} total variants)`);
  console.log(`   • ${HERO_SLIDES.length} hero slides`);
  console.log(`   • ${dealProductIndices.length} deals`);
  console.log(`   • 2 coupons`);
  console.log(`   • ${REVIEW_DATA.length} reviews`);
  console.log(`   • 4 homepage sections`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
