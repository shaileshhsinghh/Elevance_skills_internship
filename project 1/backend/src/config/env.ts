import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/fraud_db',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
  RISK_THRESHOLD: parseInt(process.env.RISK_THRESHOLD || '50'),
};