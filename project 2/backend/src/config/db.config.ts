import mongoose from 'mongoose';
import {env} from './env.config'

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = env.MONGO_URL;

  if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1); 
  }

  try {
    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(MONGO_URI);
    
    console.log(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB runtime connection error:', err);
    });

   
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost. Attempting to reconnect...');
    });

    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed gracefully due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB on startup:', error);
    process.exit(1); 
  }
};