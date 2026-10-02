// ==============================================================================
// SCRIPT KHỞI TẠO TOÀN BỘ CƠ SỞ DỮ LIỆU MONGODB CHO DỰ ÁN SẮC VIỆT
// Chạy trực tiếp bằng lệnh: node setup-mongodb.js
// ==============================================================================

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sac_viet";

async function setupDatabase() {
  console.log("-------------------------------------------------------");
  console.log("Đang kết nối tới MongoDB:", MONGODB_URI);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Kết nối MongoDB thành công!\n");

    const db = mongoose.connection.db;

    // 1. Đọc dữ liệu từ thư mục data/
    const ethnicsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "ethnics.json"), "utf-8")
    );
    const productsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf-8")
    );

    // 2. Collection 'ethnics' (54 Dân tộc)
    console.log(`Đang nạp ${ethnicsData.length} dân tộc vào collection 'ethnics'...`);
    await db.collection("ethnics").deleteMany({});
    await db.collection("ethnics").insertMany(ethnicsData);
    await db.collection("ethnics").createIndex({ slug: 1 }, { unique: true });
    await db.collection("ethnics").createIndex({ region: 1 });
    console.log(` Đã nạp xong ${await db.collection("ethnics").countDocuments()} dân tộc.`);

    // 3. Collection 'products' (14 Sản phẩm)
    console.log(`Đang nạp ${productsData.length} sản phẩm vào collection 'products'...`);
    await db.collection("products").deleteMany({});
    await db.collection("products").insertMany(productsData);
    await db.collection("products").createIndex({ id: 1 }, { unique: true });
    await db.collection("products").createIndex({ ethnicSlug: 1 });
    console.log(` Đã nạp xong ${await db.collection("products").countDocuments()} sản phẩm.`);

    // 4. Collection 'users' (Tài khoản mẫu)
    console.log("Đang tạo tài khoản quản trị và người dùng mẫu...");
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await db.collection("users").deleteMany({});
    await db.collection("users").insertMany([
      {
        name: "Ban Quản Trị Sắc Việt",
        email: "admin@sacviet.vn",
        password: hashedPassword,
        role: "admin",
        savedEthnics: ["kinh", "hmong", "thai", "tay", "cham", "khmer"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Nguyễn Văn A",
        email: "user@sacviet.vn",
        password: hashedPassword,
        role: "user",
        savedEthnics: ["kinh", "dao"],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log(` Đã tạo xong ${await db.collection("users").countDocuments()} tài khoản.`);

    // 5. Collection 'orders' (Đơn hàng mẫu)
    console.log("Đang tạo đơn hàng mẫu cho NestJS API...");
    await db.collection("orders").deleteMany({});
    await db.collection("orders").insertOne({
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
    console.log(` Đã tạo đơn hàng mẫu.`);

    console.log("\n=======================================================");
    console.log(" HOÀN TẤT TẠO DATABASE 'sac_viet' TRONG MONGODB!");
    console.log("Bạn có thể mở MongoDB Compass để xem ngay:");
    console.log("- Database: sac_viet");
    console.log("- ethnics: ", await db.collection("ethnics").countDocuments(), "bản ghi");
    console.log("- products:", await db.collection("products").countDocuments(), "bản ghi");
    console.log("- users:   ", await db.collection("users").countDocuments(), "bản ghi");
    console.log("- orders:  ", await db.collection("orders").countDocuments(), "bản ghi");
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(" Lỗi trong quá trình tạo database:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

setupDatabase();
