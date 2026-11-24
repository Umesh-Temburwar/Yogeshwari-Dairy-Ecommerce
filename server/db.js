import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root .env.local or .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'yogeshwari_dairy';

let client = null;
let db = null;
let isConnected = false;

// In-memory memory fallback store when MongoDB is offline / initializing
const inMemoryStore = {
  users: new Map(),
  otps: new Map(),
};

export async function connectDB() {
  if (isConnected && db) return db;

  if (!uri) {
    console.warn('ℹ️ MONGODB_URI not configured in environment. Running in in-memory fallback mode.');
    isConnected = false;
    return null;
  }

  try {
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`🔄 Connecting to MongoDB Atlas (${maskedUri})...`);
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db(dbName).command({ ping: 1 });
    db = client.db(dbName);
    isConnected = true;

    // Create unique indexes
    const users = db.collection('users');
    await users.createIndex({ phone: 1 }, { unique: true, sparse: true });
    await users.createIndex({ email: 1 }, { unique: true, sparse: true });

    const otps = db.collection('otps');
    await otps.createIndex({ phoneOrEmail: 1 });
    // Auto-expire OTPs after 10 minutes
    await otps.createIndex({ createdAt: 1 }, { expireAfterSeconds: 600 });

    console.log(`✅ MongoDB Atlas Connected Successfully to database: "${dbName}"`);
    return db;
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas connection notice: ${error.message}`);
    console.warn('ℹ️ Running in resilient fallback mode (in-memory auth persistence active).');
    isConnected = false;
    return null;
  }
}

export function getDB() {
  return db;
}

export function isMongoConnected() {
  return isConnected;
}

export function getInMemoryStore() {
  return inMemoryStore;
}
