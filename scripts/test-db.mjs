import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Lire .env.local manuellement
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map((v, i) => i === 0 ? v.trim() : line.slice(line.indexOf('=') + 1).trim()))
);

const MONGODB_URI = envVars.MONGODB_URI;
console.log('🔗 URI:', MONGODB_URI?.substring(0, 60) + '...');
console.log('🖥️  Node version:', process.version);

const configs = [
  { label: 'Config 1 - Standard (family:4)', opts: { serverSelectionTimeoutMS: 8000, family: 4 } },
  { label: 'Config 2 - tlsInsecure', opts: { serverSelectionTimeoutMS: 8000, tlsInsecure: true } },
  { label: 'Config 3 - Minimal', opts: { serverSelectionTimeoutMS: 8000 } },
];

for (const { label, opts } of configs) {
  console.log(`\n⏳ Test: ${label}`);
  try {
    await mongoose.connect(MONGODB_URI, opts);
    console.log(`✅ SUCCÈS avec ${label}`);
    await mongoose.disconnect();
    break;
  } catch (err) {
    console.log(`❌ ECHEC: ${err.message?.substring(0, 120)}`);
    try { await mongoose.disconnect(); } catch {}
  }
}
