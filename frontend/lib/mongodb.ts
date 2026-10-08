import mongoose from "mongoose"
import dns from "dns"

try {
  dns.setDefaultResultOrder?.("ipv4first")
  dns.setServers(["8.8.8.8", "1.1.1.1"])
} catch {
  // Ignored in restricted environments
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://duongtiendat0012_db_user:honydatviet123@honydatviet.nnfadap.mongodb.net/sac_viet?retryWrites=true&w=majority"

// URI kết nối trực tiếp đến replica set MongoDB Atlas (bỏ qua DNS SRV để tránh triệt để lỗi querySrv ECONNREFUSED)
const DIRECT_MONGODB_URI =
  "mongodb://duongtiendat0012_db_user:honydatviet123@ac-lgb9rkt-shard-00-00.nnfadap.mongodb.net:27017,ac-lgb9rkt-shard-00-01.nnfadap.mongodb.net:27017,ac-lgb9rkt-shard-00-02.nnfadap.mongodb.net:27017/sac_viet?ssl=true&authSource=admin&retryWrites=true&w=majority"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    dns.setDefaultResultOrder?.("ipv4first")
  } catch {}

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "sac_viet",
      serverSelectionTimeoutMS: 5000,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .catch(async (srvErr) => {
        console.warn("SRV connect error, falling back to direct replica set URI:", srvErr?.message)
        return mongoose.connect(DIRECT_MONGODB_URI, opts)
      })
      .then((mongooseInstance) => {
        return mongooseInstance
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB

