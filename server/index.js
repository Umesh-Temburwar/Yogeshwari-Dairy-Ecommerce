import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDB, isMongoConnected, getInMemoryStore } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'yogeshwari_dairy_auth_jwt_secret_2026';

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Initialize MongoDB on server boot
connectDB().catch(() => {});

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'customer',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No auth token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
    req.user = decoded;
    next();
  });
}

// -----------------------------------------------------------------------------
// 1. Health & Connection Status
// -----------------------------------------------------------------------------
app.get('/api/auth/health', async (req, res) => {
  const connected = isMongoConnected();
  res.json({
    status: 'ok',
    service: 'Yogeshwari Dairy Customer Auth Service',
    database: connected ? 'MongoDB Atlas (Live)' : 'In-Memory Fallback (Active)',
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------------
// 2. Send OTP (Mobile / Phone Auth)
// -----------------------------------------------------------------------------
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // Generate 6-digit OTP (for dev / local test, 123456 is also accepted)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const db = getDB();
    if (db) {
      await db.collection('otps').updateOne(
        { phoneOrEmail: cleanPhone },
        {
          $set: {
            otp,
            expiresAt,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    } else {
      getInMemoryStore().otps.set(cleanPhone, { otp, expiresAt });
    }

    console.log(`📲 [OTP DISPATCH] Mobile: ${cleanPhone} | OTP: ${otp} (Demo/Dev fallback: 123456)`);

    return res.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}. (Dev fallback OTP: 123456)`,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// -----------------------------------------------------------------------------
// 3. Verify OTP & Login / Auto-Signup
// -----------------------------------------------------------------------------
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    let isValid = false;

    // Master test OTP for smooth demo / local evaluations
    if (otp === '123456') {
      isValid = true;
    } else {
      const db = getDB();
      if (db) {
        const record = await db.collection('otps').findOne({ phoneOrEmail: cleanPhone });
        if (record && record.otp === otp && new Date() < new Date(record.expiresAt)) {
          isValid = true;
        }
      } else {
        const record = getInMemoryStore().otps.get(cleanPhone);
        if (record && record.otp === otp && new Date() < new Date(record.expiresAt)) {
          isValid = true;
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }

    // Find or create customer user
    let user = null;
    const db = getDB();

    if (db) {
      user = await db.collection('users').findOne({ phone: cleanPhone });
      if (!user) {
        const newUser = {
          id: `usr_${Date.now()}`,
          name: name ? name.trim() : `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          email: '',
          role: 'customer',
          isPhoneVerified: true,
          addresses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const insertRes = await db.collection('users').insertOne(newUser);
        user = { ...newUser, _id: insertRes.insertedId };
      }
    } else {
      const store = getInMemoryStore();
      user = store.users.get(cleanPhone);
      if (!user) {
        user = {
          id: `usr_${Date.now()}`,
          name: name ? name.trim() : `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          email: '',
          role: 'customer',
          isPhoneVerified: true,
          addresses: [],
          createdAt: new Date(),
        };
        store.users.set(cleanPhone, user);
      }
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully via Phone OTP!',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || '',
        role: user.role || 'customer',
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

// -----------------------------------------------------------------------------
// 4. Email & Password Login
// -----------------------------------------------------------------------------
app.post('/api/auth/login-email', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;
    const db = getDB();

    if (db) {
      user = await db.collection('users').findOne({ email: cleanEmail });
    } else {
      user = Array.from(getInMemoryStore().users.values()).find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found with this email. Please sign up.' });
    }

    // Verify password hash
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'customer',
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Email Login Error:', error);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// -----------------------------------------------------------------------------
// 5. User Registration (Name, Email, Phone, Password)
// -----------------------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!phone || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit Indian mobile number is required.' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const db = getDB();

    // Check existing phone or email
    if (db) {
      const existingPhone = await db.collection('users').findOne({ phone: cleanPhone });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered. Please log in.' });
      }
      if (cleanEmail) {
        const existingEmail = await db.collection('users').findOne({ email: cleanEmail });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: 'Email address already registered. Please log in.' });
        }
      }
    } else {
      const store = getInMemoryStore();
      if (store.users.has(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'Mobile number already registered. Please log in.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = password ? await bcrypt.hash(password, salt) : null;

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer',
      isPhoneVerified: true,
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (db) {
      const insertResult = await db.collection('users').insertOne(newUser);
      newUser._id = insertResult.insertedId;
    } else {
      getInMemoryStore().users.set(cleanPhone, newUser);
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Yogeshwari Dairy.',
      token,
      user: {
        id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        addresses: newUser.addresses,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// -----------------------------------------------------------------------------
// 6. Get Current User Profile
// -----------------------------------------------------------------------------
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    let user = null;

    if (db) {
      user = await db.collection('users').findOne({
        $or: [{ id: req.user.id }, { phone: req.user.phone }, { email: req.user.email }],
      });
    } else {
      user = getInMemoryStore().users.get(req.user.phone) || req.user;
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

// -----------------------------------------------------------------------------
// 7. Update User Profile & Addresses
// -----------------------------------------------------------------------------
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, addresses } = req.body;
    const updateFields = { updatedAt: new Date() };

    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (Array.isArray(addresses)) updateFields.addresses = addresses;

    const db = getDB();
    if (db) {
      await db.collection('users').updateOne(
        { $or: [{ id: req.user.id }, { phone: req.user.phone }] },
        { $set: updateFields }
      );
    } else {
      const stored = getInMemoryStore().users.get(req.user.phone);
      if (stored) {
        Object.assign(stored, updateFields);
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB.',
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Yogeshwari Dairy MongoDB Auth Server listening on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api/auth`);
});
