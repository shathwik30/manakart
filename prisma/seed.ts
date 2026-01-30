import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'


dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set. Please check your .env file.')
  process.exit(1)
}


console.log(`📦 Connecting to database: ${connectionString.split('@')[1] || '...'} ...`)

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...')
  
  const models = [
    'orderItem', 'order', 'cartItem', 'cart',
    'oTP', 'address', 'outfitItem', 'outfit',
    'product', 'coupon', 'review', 'heroContent', 'reel', 'user'
  ]

  for (const model of models) {
    try {
      
      await (prisma as any)[model].deleteMany()
    } catch (error) {
      console.warn(`⚠️ Warning deleting ${model}:`, error)
    }
  }
}

async function seedUsers() {
  console.log('👤 Creating users...')
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@yourbrand.com',
      name: 'Admin',
      phone: '9999999999',
      role: 'ADMIN',
    },
  })
  console.log(`   Admin created: ${admin.email}`)

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      phone: '9876543210',
      role: 'USER',
    },
  })
  console.log(`   Test user created: ${testUser.email}`)
  
  return { admin, testUser }
}

async function seedProducts() {
  console.log('👔 Creating products...')
  
  
  const blazerNavy = await prisma.product.create({
    data: {
      title: 'Navy Wool Blazer',
      slug: 'navy-wool-blazer',
      category: 'blazer',
      description: 'Timeless navy wool blazer with gold buttons. Perfect for any occasion.',
      basePrice: 1299900, 
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800'],
      availableSizes: ['S', 'M', 'L', 'XL'],
      stockPerSize: { S: 10, M: 15, L: 12, XL: 8 },
      sizeChart: { S: { chest: 38 }, M: { chest: 40 }, L: { chest: 42 }, XL: { chest: 44 } },
    },
  })

  const trousersCharcoal = await prisma.product.create({
    data: {
      title: 'Charcoal Wool Trousers',
      slug: 'charcoal-wool-trousers',
      category: 'trousers',
      description: 'Classic fit wool trousers in charcoal. Comfortable and elegant.',
      basePrice: 699900,
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
      availableSizes: ['28', '30', '32', '34', '36'],
      stockPerSize: { '28': 8, '30': 12, '32': 15, '34': 12, '36': 8 },
      sizeChart: { '32': { waist: 32 } },
    },
  })

  const shirtWhite = await prisma.product.create({
    data: {
      title: 'White Oxford Shirt',
      slug: 'white-oxford-shirt',
      category: 'shirt',
      description: 'Crisp white Oxford cotton shirt. A wardrobe essential.',
      basePrice: 499900,
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
      availableSizes: ['S', 'M', 'L', 'XL'],
      stockPerSize: { S: 20, M: 25, L: 20, XL: 15 },
    },
  })

  const oxfordShoes = await prisma.product.create({
    data: {
      title: 'Brown Oxford Shoes',
      slug: 'brown-oxford-shoes',
      category: 'shoes',
      description: 'Hand-crafted leather Oxford shoes in rich brown.',
      basePrice: 899900,
      images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'],
      availableSizes: ['7', '8', '9', '10', '11'],
      stockPerSize: { '7': 5, '8': 10, '9': 12, '10': 10, '11': 5 },
    },
  })

  const silkTie = await prisma.product.create({
    data: {
      title: 'Burgundy Silk Tie',
      slug: 'burgundy-silk-tie',
      category: 'accessory',
      description: 'Luxurious silk tie in deep burgundy.',
      basePrice: 299900,
      images: ['https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800'],
      availableSizes: ['ONE SIZE'],
      stockPerSize: { 'ONE SIZE': 30 },
    },
  })

  
  const dressBlack = await prisma.product.create({
    data: {
      title: 'Black Cocktail Dress',
      slug: 'black-cocktail-dress',
      category: 'dress',
      description: 'Elegant black cocktail dress. Timeless sophistication.',
      basePrice: 1599900,
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
      availableSizes: ['XS', 'S', 'M', 'L'],
      stockPerSize: { XS: 5, S: 10, M: 12, L: 8 },
    },
  })

  const heelsNude = await prisma.product.create({
    data: {
      title: 'Nude Stiletto Heels',
      slug: 'nude-stiletto-heels',
      category: 'shoes',
      description: 'Classic nude stiletto heels. Elongate your silhouette.',
      basePrice: 799900,
      images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
      availableSizes: ['5', '6', '7', '8'],
      stockPerSize: { '5': 5, '6': 10, '7': 10, '8': 5 },
    },
  })

  const clutchGold = await prisma.product.create({
    data: {
      title: 'Gold Clutch Bag',
      slug: 'gold-clutch-bag',
      category: 'accessory',
      description: 'Stunning gold clutch bag for evening occasions.',
      basePrice: 599900,
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
      availableSizes: ['ONE SIZE'],
      stockPerSize: { 'ONE SIZE': 15 },
    },
  })

  console.log('   Products created: 8')
  return { blazerNavy, trousersCharcoal, shirtWhite, oxfordShoes, silkTie, dressBlack, heelsNude, clutchGold }
}

async function seedOutfits(products: any) {
  console.log('👗 Creating outfits...')
  
  const { blazerNavy, trousersCharcoal, shirtWhite, oxfordShoes, silkTie, dressBlack, heelsNude, clutchGold } = products

  await prisma.outfit.create({
    data: {
      title: 'The Windsor Collection',
      slug: 'the-windsor-collection',
      genderType: 'GENTLEMEN',
      description: 'A distinguished ensemble for the modern gentleman.',
      heroImages: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'],
      bundlePrice: 2499900,
      isActive: true,
      isFeatured: true,
      items: {
        create: [
          { productId: blazerNavy.id, position: 0 },
          { productId: trousersCharcoal.id, position: 1 },
          { productId: oxfordShoes.id, position: 2 },
        ],
      },
    },
  })

  await prisma.outfit.create({
    data: {
      title: 'The Boardroom',
      slug: 'the-boardroom',
      genderType: 'GENTLEMEN',
      description: 'Command attention in the boardroom.',
      heroImages: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800'],
      bundlePrice: 2199900,
      isActive: true,
      isFeatured: true,
      items: {
        create: [
          { productId: blazerNavy.id, position: 0 },
          { productId: shirtWhite.id, position: 1 },
          { productId: trousersCharcoal.id, position: 2 },
          { productId: silkTie.id, position: 3 },
        ],
      },
    },
  })

  const ladyOutfit1 = await prisma.outfit.create({
    data: {
      title: 'Evening Elegance',
      slug: 'evening-elegance',
      genderType: 'LADY',
      description: 'Turn heads at any evening event.',
      heroImages: ['https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=800'],
      bundlePrice: 2199900,
      isActive: true,
      isFeatured: true,
      items: {
        create: [
          { productId: dressBlack.id, position: 0 },
          { productId: heelsNude.id, position: 1 },
          { productId: clutchGold.id, position: 2 },
        ],
      },
    },
  })

  const coupleOutfit = await prisma.outfit.create({
    data: {
      title: 'The Power Couple',
      slug: 'the-power-couple',
      genderType: 'COUPLE',
      description: 'Make a statement together.',
      heroImages: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
      bundlePrice: 4499900,
      isActive: true,
      isFeatured: true,
      items: {
        create: [
          { productId: blazerNavy.id, position: 0 },
          { productId: trousersCharcoal.id, position: 1 },
          { productId: dressBlack.id, position: 2 },
          { productId: heelsNude.id, position: 3 },
        ],
      },
    },
  })

  console.log('   Outfits created: 4')
  return { ladyOutfit1, coupleOutfit }
}

async function seedCoupons() {
  console.log('🎟️ Creating coupons...')
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', discountType: 'PERCENTAGE', value: 10, maxDiscount: 200000, isActive: true },
      { code: 'FLAT500', discountType: 'FLAT', value: 50000, minOrderValue: 300000, isActive: true },
      { code: 'LUXURY20', discountType: 'PERCENTAGE', value: 20, minOrderValue: 1000000, maxDiscount: 500000, usageLimit: 100, expiresAt: new Date('2025-12-31'), isActive: true },
    ],
  })
}

async function seedReviews() {
  console.log('⭐ Creating reviews...')
  await prisma.review.createMany({
    data: [
      { userName: 'Rahul M.', rating: 5, comment: 'Absolutely stunning quality.', isFeatured: true, isApproved: true },
      { userName: 'Priya S.', rating: 5, comment: 'Made me feel like a star.', isFeatured: true, isApproved: true },
      { userName: 'Vikram R.', rating: 4, comment: 'Great quality and fast delivery.', isFeatured: true, isApproved: true },
      { userName: 'Ananya K.', rating: 5, comment: 'Impeccable craftsmanship.', isFeatured: true, isApproved: true },
      { userName: 'Arjun P.', rating: 5, comment: 'Exceeded my expectations.', isFeatured: false, isApproved: true },
    ],
  })
}

async function seedHeroContent() {
  console.log('🖼️ Creating hero content...')
  await prisma.heroContent.createMany({
    data: [
      {
        title: 'Timeless Elegance',
        subtitle: 'Discover our curated collection of luxury essentials',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600',
        ctaText: 'Shop Collection',
        ctaLink: '/collections/gentlemen',
        isActive: true,
        position: 0,
      },
      {
        title: 'The Art of Dressing',
        subtitle: 'Where sophistication meets modern style',
        image: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=1600',
        ctaText: 'Explore Now',
        ctaLink: '/collections/lady',
        isActive: true,
        position: 1,
      },
      {
        title: 'New Season Arrivals',
        subtitle: 'Introducing our latest curated outfits',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600',
        ctaText: 'View New Arrivals',
        ctaLink: '/collections',
        isActive: true,
        position: 2,
      },
    ],
  })
}

async function seedReels(outfits: any) {
  console.log('🎬 Creating reels...')
  if (!outfits || !outfits.ladyOutfit1 || !outfits.coupleOutfit) {
     console.warn('⚠️ Skipping partial reels due to missing outfits')
     return
  }

  await prisma.reel.createMany({
    data: [
      {
        videoUrl: 'https://example.com/videos/reel1.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400',
        title: 'The Windsor Look',
        
        
        
        isActive: true,
        position: 0,
      },
    ],
  })
  
  
  await prisma.reel.create({
      data: {
          videoUrl: 'https://example.com/videos/reel2.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=400',
          title: 'Evening Ready',
          outfitId: outfits.ladyOutfit1.id,
          isActive: true,
          position: 1,
      }
  })
    await prisma.reel.create({
      data: {
          videoUrl: 'https://example.com/videos/reel3.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
          title: 'Power Couple Goals',
          outfitId: outfits.coupleOutfit.id,
          isActive: true,
          position: 2,
      }
  })
}

async function seedAddresses(userId: string) {
  console.log('📍 Creating address...')
  await prisma.address.create({
    data: {
      userId: userId,
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      street: '123 Test Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      isDefault: true,
    },
  })
}

async function main() {
  console.log('🌱 Starting seed...')
  
  try {
    await cleanDatabase()
    
    const { testUser } = await seedUsers()
    const products = await seedProducts()
    const outfits = await seedOutfits(products)
    
    await seedCoupons()
    await seedReviews()
    await seedHeroContent()
    await seedReels(outfits)
    await seedAddresses(testUser.id)

    console.log('')
    console.log('✅ Seed completed successfully!')
  } catch (e) {
    console.error('❌ Seed failed with unexpected error:')
    console.error(e)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })