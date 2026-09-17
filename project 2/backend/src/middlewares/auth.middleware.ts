import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response.util';

export const verifyTokenAndRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return sendResponse(res, 401, null, null, { message: 'Authentication required', errorCode: 'UNAUTHORIZED' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { role: string, userId: string };
      
      if (!roles.includes(decoded.role)) {
        return sendResponse(res, 403, null, null, { message: 'Insufficient permissions', errorCode: 'FORBIDDEN' });
      }

      (req as any).user = decoded;
      next();
    } catch (error) {
      return sendResponse(res, 401, null, null, { message: 'Invalid or expired token', errorCode: 'INVALID_TOKEN' });
    }
  };
};