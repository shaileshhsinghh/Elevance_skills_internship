import { Response } from 'express';

export const sendResponse = (
  res: Response,
  statusCode: number,
  data: any = null,
  meta: any = null,
  error: { message: string; errorCode: string; details?: any } | null = null
) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    data,
    error,
    meta
  });
};