import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Lire .env.local
const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const MONGODB_URI = envContent.split('\n').find(l => l.startsWith('MONGODB_URI=')).split('=').slice(1).join('=').trim();

await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, family: 4 });
console.log('✅ Connecté à MongoDB');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true, trim: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'director', 'creator'], default: 'creator' },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const email = 'h.bensalahh@gmail.com';

const result = await User.findOneAndUpdate(
  { email },
  { role: 'admin', isApproved: true },
  { new: true }
);

if (!result) {
  console.log('❌ Utilisateur non trouvé :', email);
} else {
  console.log('✅ Compte mis à jour avec succès !');
  console.log('   Nom     :', result.name);
  console.log('   Email   :', result.email);
  console.log('   Rôle    :', result.role);
  console.log('   Approuvé:', result.isApproved);
}

await mongoose.disconnect();
