import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import { ethnicGroups, products } from "../lib/ethnic-data"

async function run() {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Hash password for admin
  const hashed = await bcrypt.hash("Admin@123", 10)

  const mongoScript = `// File script khởi tạo database cho MongoDB Shell (mongosh) hoặc MongoDB Compass
use sac_viet;

// 1. Tạo và nạp dữ liệu 54 Dân tộc
db.ethnics.drop();
db.ethnics.insertMany(${JSON.stringify(ethnicGroups, null, 2)});

// 2. Tạo và nạp dữ liệu Sản phẩm
db.products.drop();
db.products.insertMany(${JSON.stringify(products, null, 2)});

// 3. Tạo tài khoản Quản trị viên (Mật khẩu: Admin@123)
db.users.drop();
db.users.insertOne({
  name: "Ban Quản Trị Hồn Y Đất Việt",
  email: "admin@sacviet.vn",
  password: "${hashed}",
  role: "admin",
  savedEthnics: ["kinh", "hmong", "thai", "tay", "cham", "khmer"],
  createdAt: new Date(),
  updatedAt: new Date()
});

print("=== ĐÃ TẠO DATABASE SAC_VIET THÀNH CÔNG ===");
print("Số dân tộc: " + db.ethnics.countDocuments());
print("Số sản phẩm: " + db.products.countDocuments());
print("Số người dùng: " + db.users.countDocuments());
`

  fs.writeFileSync(path.join(dataDir, "init-mongo.js"), mongoScript, "utf-8")
  console.log("data/init-mongo.js generated successfully!")
}

run()

