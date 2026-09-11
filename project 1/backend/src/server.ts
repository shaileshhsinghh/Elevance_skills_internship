import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import { seedAdmin } from './controllers/auth.controller';

const start = async () => {
  await connectDB();
  await seedAdmin(); // Ensure admin exists

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();