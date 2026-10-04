import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: String,
  role: { type: String, default: 'admin' },
});

if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
