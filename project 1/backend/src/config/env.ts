import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) ,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/fraud_db',
  JWT_SECRET: process.env.JWT_SECRET || 'Admin',
  RISK_THRESHOLD: parseInt(process.env.RISK_THRESHOLD || '50'),
  ADMIN_SECRET_KEY : process.env.ADMIN_SECRET_KEY || 'Admin@123',
};