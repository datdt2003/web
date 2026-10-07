const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = 'mongodb+srv://duongtiendat0012_db_user:honydatviet123@honydatviet.nnfadap.mongodb.net/sac_viet?retryWrites=true&w=majority';

async function updateSixEthnics() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.collection('products');
  
  const sixSlugs = ['tay', 'thai', 'muong', 'nung', 'khmer', 'hmong'];

  // Cập nhật tất cả sản phẩm của 6 dân tộc này thành forSale: true, inStock: true
  const res = await col.updateMany(
    { ethnicSlug: { $in: sixSlugs } },
    { $set: { forSale: true, inStock: true } }
  );
  console.log('Updated existing products in DB:', res.modifiedCount);

  // Kiểm tra xem dân tộc nào trong 6 dân tộc chưa có sản phẩm trong DB
  const existing = await col.find({ ethnicSlug: { $in: sixSlugs } }).toArray();
  const existingSlugs = new Set(existing.map(p => p.ethnicSlug));
  console.log('Existing slugs in DB:', Array.from(existingSlugs));

  // Định nghĩa sản phẩm mẫu cho các dân tộc còn thiếu trong 6 dân tộc
  const fallbackItems = [
    {
      id: 'p-nung-1',
      name: 'Vải chàm dệt tay người Nùng',
      price: 260000,
      image: '/images/ethnic-tay.png',
      ethnicSlug: 'nung',
      category: 'Thổ cẩm',
      description: 'Vải dệt từ sợi bông tự nhiên, nhuộm chàm thủ công nhiều lần tạo nên sắc xanh chàm đặc trưng của đồng bào Nùng.',
      forSale: true,
      inStock: true
    },
    {
      id: 'p-muong-2',
      name: 'Cồng chiêng Mường chế tác đồng',
      price: 850000,
      image: '/images/ethnic-tay.png',
      ethnicSlug: 'muong',
      category: 'Nhạc cụ',
      description: 'Nhạc cụ cồng chiêng gắn liền với đời sống tâm linh, nghi lễ và các ngày hội lớn của người Mường.',
      forSale: true,
      inStock: true
    }
  ];

  for (const item of fallbackItems) {
    const found = await col.findOne({ id: item.id });
    if (!found) {
      await col.insertOne({ ...item, createdAt: new Date(), updatedAt: new Date() });
      console.log('Inserted new product:', item.name, 'for', item.ethnicSlug);
    } else {
      await col.updateOne({ id: item.id }, { $set: { forSale: true, inStock: true } });
    }
  }

  const allUpdated = await col.find({ ethnicSlug: { $in: sixSlugs } }).toArray();
  console.log('\nFinal products for 6 ethnic groups in DB:');
  allUpdated.forEach(p => {
    console.log(`- [${p.ethnicSlug.toUpperCase()}] ${p.name} | Giá: ${p.price} | forSale: ${p.forSale}`);
  });

  await mongoose.disconnect();
}

updateSixEthnics().catch(console.error);
