import mongoose from "mongoose"
import dns from "dns"

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"])
} catch {
  // Ignored in restricted environments
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://duongtiendat0012_db_user:honydatviet123@honydatviet.nnfadap.mongodb.net/sac_viet?retryWrites=true&w=majority"

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
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "sac_viet",
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
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

