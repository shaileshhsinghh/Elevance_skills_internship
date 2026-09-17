import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import publicRoutes from './routes/public.routes';
import Restaurant from './routes/admin.routes'; 

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json());

app.use('/api/admin/restaurant', Restaurant);
app.use('/api/restaurants', publicRoutes);
// app.use('/api/admin/restaurants', adminRoutes);

export default app;