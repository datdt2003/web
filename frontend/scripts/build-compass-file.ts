import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import { ethnicGroups, products } from "../lib/ethnic-data"

async function main() {
  const hash = await bcrypt.hash("Admin@123", 10)

  const compassScript = `// ==============================================================================
// FILE SETUP DATABASE CHO MONGODB COMPASS
// Database: sac_viet
// Cách dùng:
//   1. Mở MongoDB Compass, kết nối tới mongodb://127.0.0.1:27017
//   2. Nhìn xuống đáy cửa sổ Compass -> Bấm mở tab "_MONGOSH"
//   3. Dán toàn bộ nội dung file này vào rồi nhấn phím Enter
// ==============================================================================

use sac_viet;

// 1. TẠO COLLECTION VÀ NẠP 54 DÂN TỘC VIỆT NAM
db.ethnics.drop();
db.createCollection("ethnics");
db.ethnics.insertMany(${JSON.stringify(ethnicGroups, null, 2)});
db.ethnics.createIndex({ slug: 1 }, { unique: true });
db.ethnics.createIndex({ region: 1 });

// 2. TẠO COLLECTION VÀ NẠP SẢN PHẨM THỦ CÔNG / ĐẶC SẢN
db.products.drop();
db.createCollection("products");
db.products.insertMany(${JSON.stringify(products, null, 2)});
db.products.createIndex({ id: 1 }, { unique: true });
db.products.createIndex({ ethnicSlug: 1 });

// 3. TẠO COLLECTION TÀI KHOẢN NGƯỜI DÙNG & ADMIN
db.users.drop();
db.createCollection("users");
db.users.insertMany([
  {
    name: "Ban Quản Trị Sắc Việt",
    email: "admin@sacviet.vn",
    password: "${hash}",
    role: "admin",
    savedEthnics: ["kinh", "hmong", "thai", "tay", "cham", "khmer"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Nguyễn Văn A",
    email: "user@sacviet.vn",
    password: "${hash}",
    role: "user",
    savedEthnics: ["kinh", "dao"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
db.users.createIndex({ email: 1 }, { unique: true });

// 4. TẠO COLLECTION ĐƠN HÀNG (MẪU DÀNH CHO NESTJS API QUẢN LÝ)
db.orders.drop();
db.createCollection("orders");
db.orders.insertOne({
  customerName: "Nguyễn Văn A",
  email: "user@sacviet.vn",
  phone: "0912345678",
  address: "123 Đường Giải Phóng, Hà Nội",
  items: [
    {
      productId: "p-hmong-1",
      name: "Khăn thổ cẩm H'Mông thêu tay",
      price: 350000,
      qty: 2,
      image: "/images/ethnic-hmong.png",
      category: "Thổ cẩm"
    }
  ],
  subtotal: 700000,
  shippingFee: 30000,
  total: 730000,
  status: "pending",
  notes: "Giao giờ hành chính",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("\\n======================================================");
print("✅ ĐÃ TẠO DATABASE 'sac_viet' THÀNH CÔNG TRONG MONGODB!");
print("======================================================");
print("- Collection 'ethnics':  " + db.ethnics.countDocuments() + " documents");
print("- Collection 'products': " + db.products.countDocuments() + " documents");
print("- Collection 'users':    " + db.users.countDocuments() + " documents");
print("- Collection 'orders':   " + db.orders.countDocuments() + " documents");
print("======================================================\\n");
`

  // Lưu file ngay tại thư mục gốc của project
  const rootFilePath = path.join(process.cwd(), "setup-mongodb-compass.js")
  fs.writeFileSync(rootFilePath, compassScript, "utf-8")
  console.log("Generated:", rootFilePath)

  // Cũng lưu các file json tương ứng vào thư mục data/
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(path.join(dataDir, "ethnics.json"), JSON.stringify(ethnicGroups, null, 2), "utf-8")
  fs.writeFileSync(path.join(dataDir, "products.json"), JSON.stringify(products, null, 2), "utf-8")
}

main().catch(console.error)

