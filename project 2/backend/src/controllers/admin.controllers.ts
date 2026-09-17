// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { adminLoginSchema } from '../validation/admin.validation';
import { sendResponse } from '../utils/response.util';
import { env } from '../config/env.config';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    // 1. Validate incoming payload using Zod
    const { body } = adminLoginSchema.parse(req);
    const { email, password } = body;

    // 2. Fetch credentials and secrets from environment variables
    const expectedEmail = env.ADMIN_EMAIL;
    const expectedPassword = env.ADMIN_PASSWORD;
    const jwtSecret = env.JWT_SECRET;

    // 3. Server misconfiguration check (Rule 6: Security & 500 semantic code)
    if (!expectedEmail || !expectedPassword || !jwtSecret) {
      console.error('Server Misconfiguration: Missing admin credentials or JWT secret in .env');
      return sendResponse(res, 500, null, null, {
        message: 'Internal server configuration error',
        errorCode: 'SERVER_MISCONFIGURED'
      });
    }

    // 4. Verify credentials (Rule 5 & semantic 401 response)
    if (email !== expectedEmail || password !== expectedPassword) {
      // Security: Use a generic error message to prevent email enumeration
      return sendResponse(res, 401, null, null, {
        message: 'Invalid email or password',
        errorCode: 'UNAUTHORIZED'
      });
    }

    // 5. Generate JWT Token (Rule 5: Admin session expiration)
    // The payload includes the 'admin' role which maps to your RBAC middleware
    const token = jwt.sign(
      { userId: 'admin-system', email, role: 'admin' },
      jwtSecret,
      { expiresIn: '2h' } // Token expires in 2 hours
    );

    // 6. Return standard success envelope
    return sendResponse(res, 200, { token }, null, null);

  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return sendResponse(res, 400, null, null, {
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    // Handle unexpected server errors
    console.error('Login error:', error);
    return sendResponse(res, 500, null, null, {
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};