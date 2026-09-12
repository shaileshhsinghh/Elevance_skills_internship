import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { IUser, User } from '../models/User.model';
import { env } from '../config/env';
import { createError } from '../middlewares/error.middleware';

interface RegisterRequestBody {
  email: string;
  password: string;
  adminKey?: string;
}

export const registerUser = async (
  req: Request<{ role: string }, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.params;
    const { email, password, adminKey } = req.body;

    // --- 1. Validate role ---
    if (!['user', 'admin'].includes(role)) {
      return next(createError(400, 'Invalid role in URL.'));
    }

    // --- 2. Input validation ---
    if (!email || !password) {
      return next(createError(400, 'Email and password are required.'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, 'Invalid email format.'));
    }

    if (password.length < 8) {
      return next(createError(400, 'Password must be at least 8 characters.'));
    }

    // --- 3. Determine role safely ---
    let finalRole: 'user' | 'admin' = 'user';

    if (role === 'admin') {
      if (!adminKey || adminKey !== env.ADMIN_SECRET_KEY) {
        return next(createError(403, 'Invalid or missing admin key.'));
      }
      finalRole = 'admin';
    }

    // --- 4. Check duplicate email ---
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(createError(409, 'An account with this email already exists.'));
    }

    // --- 5. Hash password ---
    const SALT_ROUNDS = 12;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- 6. Create user ---
    const newUser: IUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: finalRole,
      isRestricted: false,
      createdAt: new Date(),
    });

    // --- 7. Success response ---
    res.status(201).json({
      message: `${finalRole} registered successfully.`,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        isRestricted: newUser.isRestricted,
        createdAt: newUser.createdAt,
      },
    });

  } catch (error) {
    next(error);
  }
};