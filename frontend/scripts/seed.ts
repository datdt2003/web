import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { ethnicGroups, products } from "../lib/ethnic-data"
import { Ethnic } from "../models/Ethnic"
import { Product } from "../models/Product"
import { User } from "../models/User"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sac_viet"

async function runSeed() {
  console.log("Connecting to MongoDB at:", MONGODB_URI)
  await mongoose.connect(MONGODB_URI)
  console.log("Connected successfully!")

  // 1. Seed Ethnic Groups (54 dân tộc)
  console.log(`Seeding ${ethnicGroups.length} ethnic groups...`)
  for (const item of ethnicGroups) {
    await Ethnic.findOneAndUpdate(
      { slug: item.slug },
      {
        slug: item.slug,
        name: item.name,
        altNames: item.altNames,
        region: item.region,
        regions: item.regions || [item.region],
        population: item.population,
        languageFamily: item.languageFamily,
        image: item.image,
        blurb: item.blurb,
        detail: item.detail,
        culture: item.culture,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
  const ethnicCount = await Ethnic.countDocuments()
  console.log(`Total ethnic groups in database: ${ethnicCount}`)

  // 2. Seed Products
  console.log(`Seeding ${products.length} products...`)
  for (const p of products) {
    await Product.findOneAndUpdate(
      { id: p.id },
      {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        ethnicSlug: p.ethnicSlug,
        category: p.category,
        description: p.description,
        forSale: false,
        inStock: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }
  const productCount = await Product.countDocuments()
  console.log(`Total products in database: ${productCount}`)

  // 3. Seed Default Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@sacviet.vn"
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123"
  const existingAdmin = await User.findOne({ email: adminEmail })
  if (!existingAdmin) {
    console.log("Creating default administrator account...")
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await User.create({
      name: "Ban Quản Trị Sắc Việt",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      savedEthnics: ["kinh", "hmong", "thai", "tay", "cham", "khmer"],
    })
    console.log(`Created default admin: ${adminEmail}`)
  } else {
    console.log(`Admin user ${adminEmail} already exists.`)
  }

  console.log("Database seed completed successfully!")
  await mongoose.disconnect()
  process.exit(0)
}

runSeed().catch((err) => {
  console.error("Seed error:", err)
  mongoose.disconnect()
  process.exit(1)
})

