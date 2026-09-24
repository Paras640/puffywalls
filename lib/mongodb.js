import mongoose from 'mongoose';
import dns from 'dns';

// Custom lookup function that uses dns.resolve4 (respects dns.setServers)
// instead of dns.lookup (which uses the OS resolver and IGNORES dns.setServers).
// This is the key fix: your ISP's DNS can't resolve MongoDB Atlas SRV records,
// but Google's DNS (8.8.8.8) can. This bypasses your broken local DNS.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

function customLookup(hostname, options, callback) {
  // First try dns.resolve4 with our Google DNS servers (respects dns.setServers)
  dns.resolve4(hostname, (err, addresses) => {
    if (!err && addresses && addresses.length > 0) {
      return callback(null, addresses[0], 4);
    }
    // Fallback to default OS lookup (handles cases dns.resolve4 can't)
    dns.lookup(hostname, options, callback);
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('Please define MONGODB_URI in your .env.local file');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI is not configured');
    console.error('>>> MongoDB connection skipped:', error.message);
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      // Inject our custom DNS lookup so Mongoose uses Google DNS instead of OS DNS
      lookup: customLookup,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('>>> MongoDB connected successfully');
      return mongooseInstance;
    }).catch((error) => {
      console.error('>>> MongoDB connection failed:', error.message);
      cached.promise = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;