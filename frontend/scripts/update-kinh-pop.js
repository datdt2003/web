const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = 'mongodb+srv://duongtiendat0012_db_user:honydatviet123@honydatviet.nnfadap.mongodb.net/sac_viet?retryWrites=true&w=majority';

async function updateKinh() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.collection('ethnics');
  const res = await col.updateOne({ slug: 'kinh' }, { $set: { population: 88203816 } });
  console.log('Updated Kinh in DB:', res.modifiedCount);

  // Tính lại tổng dân số từ DB
  const ethnics = await col.find({}).project({ population: 1 }).toArray();
  const sum = ethnics.reduce((acc, e) => acc + (e.population || 0), 0);
  console.log('Total population in DB ethnics collection:', sum.toLocaleString('vi-VN'));

  await mongoose.disconnect();
}

updateKinh().catch(console.error);

