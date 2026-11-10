import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'creator'], default: 'creator' },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.env.ADMIN_EMAIL || 'admin@sarabquest.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      console.log('Updating to admin role...');
      existing.role = 'admin';
      existing.isApproved = true;
      existing.password = await bcrypt.hash(password, 12);
      await existing.save();
      console.log('Admin updated successfully!');
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        name: 'Administrateur',
        email,
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
      });
      console.log(`Admin created: ${email}`);
    }

    console.log('\nCredentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
