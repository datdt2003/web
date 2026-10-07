const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = 'mongodb+srv://duongtiendat0012_db_user:honydatviet123@honydatviet.nnfadap.mongodb.net/sac_viet?retryWrites=true&w=majority';

async function fix() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.collection('users');
  
  // Set all accounts except admin@sacviet.vn to role: 'user'
  const res = await col.updateMany(
    { email: { $ne: 'admin@sacviet.vn' } },
    { $set: { role: 'user' } }
  );
  console.log('Modified count:', res.modifiedCount);

  const users = await col.find({}).project({ name: 1, email: 1, role: 1 }).toArray();
  console.log('Updated users:');
  console.log(JSON.stringify(users, null, 2));

  await mongoose.disconnect();
}

fix().catch(console.error);
