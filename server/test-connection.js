import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

console.log('====================================================');
console.log('🧪 YOGESHWARI DAIRY — MONGODB ATLAS CONNECTION TEST');
console.log('====================================================');

if (!uri) {
  console.error('\n❌ [CONFIG ERROR] MONGODB_URI is not set in .env.local.');
  console.log('Please add your MongoDB connection string in .env.local:');
  console.log('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/yogeshwari_dairy?retryWrites=true&w=majority\n');
  process.exit(1);
}

const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`Connecting with URI: ${maskedUri}`);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 8000,
  socketTimeoutMS: 10000,
});

async function runTest() {
  try {
    const startTime = Date.now();
    await client.connect();
    const pingResult = await client.db('admin').command({ ping: 1 });
    const latency = Date.now() - startTime;

    console.log(`\n✅ [SUCCESS] Successfully connected to MongoDB Atlas!`);
    console.log(`📡 Ping Latency: ${latency}ms`);
    console.log(`📊 Command Response:`, pingResult);

    const db = client.db('yogeshwari_dairy');
    const collections = await db.listCollections().toArray();
    console.log(`📂 Collections in 'yogeshwari_dairy':`, collections.map(c => c.name));
    console.log('\n🎉 Ready for Email & Phone User Authentication!');
  } catch (error) {
    console.error(`\n❌ [CONNECTION NOTICE] Could not connect to MongoDB Atlas directly:`);
    console.error(`Message: ${error.message}`);
    console.log('\n💡 Step-by-Step Fixes:');
    console.log('1. Network Access: Ensure your IP (or 0.0.0.0/0) is allowed in MongoDB Atlas -> Network Access.');
    console.log('2. Cluster Name: Ensure your cluster address matches your Atlas cluster (e.g. cluster0.xxxx.mongodb.net).');
    console.log('3. Password: Ensure your database user password has no special unescaped characters.');
  } finally {
    await client.close();
  }
}

runTest();
