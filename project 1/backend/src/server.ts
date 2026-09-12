import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

const start = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();