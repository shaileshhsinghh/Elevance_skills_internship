import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
// import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import userregistration from './routes/userregister.routes';
import { notFoundHandler,errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth/:role', authRoutes);
app.use('/api/users/:role', userregistration);
// app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFoundHandler);

app.use(errorHandler);

export default app;