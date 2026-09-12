import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { createError } from '../middlewares/error.middleware';

interface LoginRequestBody {
  email: string;
  password: string;
  adminKey?: string;
}

export const loginUser = async (
  req: Request<{ role: string }, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.params;
    const { email, password, adminKey } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return next(createError(400, 'Invalid role in URL.'));
    }

    if (!email || !password) {
      return next(createError(400, 'Email and password are required.'));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(createError(401, 'Invalid credentials.'));
    }

    if (user.role !== role) {
      return next(createError(403, 'Access denied for this role.'));
    }

    if (role === 'admin') {
      if (!adminKey || adminKey !== env.ADMIN_SECRET_KEY) {
        return next(createError(403, 'Invalid or missing admin key.'));
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError(401, 'Invalid credentials.'));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: `${role} logged in successfully.`,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};