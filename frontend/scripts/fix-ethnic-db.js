const mongoose = require('mongoose');

const updates = [
  {
    slug: 'gie-trieng',
    set: {
      blurb: 'Cư dân bắc Tây Nguyên với nghề đan lát và cồng chiêng.',
      detail: 'Người Gié Triêng sống ở Kon Tum, Quảng Nam. Họ nổi tiếng với nghề đan lát tinh xảo, nhà rông và các lễ hội cồng chiêng.',
      culture: ['Đan lát', 'Nhà rông', 'Cồng chiêng', 'Lễ ăn trâu'],
    },
  },
  {
    slug: 'ma',
    set: {
      blurb: 'Cư dân nam Tây Nguyên với nghề dệt thổ cẩm truyền thống.',
      detail: 'Người Mạ cư trú ở Lâm Đồng, Đắk Nông. Dệt thổ cẩm, cồng chiêng và các lễ hội nông nghiệp là những nét văn hóa tiêu biểu.',
      culture: ['Dệt thổ cẩm', 'Cồng chiêng', 'Nhà dài', 'Lễ hội đâm trâu'],
    },
  },
  {
    slug: 'pa-then',
    set: {
      culture: ['Lễ nhảy lửa', 'Trang phục đỏ', 'Dệt vải', 'Kéo chày'],
    },
  },
];

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sac_viet');
  const db = mongoose.connection.db;

  for (const update of updates) {
    const result = await db.collection('ethnics').updateOne({ slug: update.slug }, { $set: update.set });
    console.log(`${update.slug}: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
  }

  const bad = await db.collection('ethnics').find({
    $or: [
      { blurb: { $regex: '��|�' } },
      { detail: { $regex: '��|�' } },
      { culture: { $regex: '��|�' } },
    ],
  }).toArray();

  console.log(`remaining bad records: ${bad.length}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
