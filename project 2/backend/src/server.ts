import app from './app';
import { connectDB } from './config/db.config';
import { env } from './config/env.config';

const start = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();