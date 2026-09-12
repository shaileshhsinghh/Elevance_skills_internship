import { Request, Response, NextFunction } from "express";

// ✅ 404 — catches any request that didn't match a route
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json(
    {
      msg: "Route not Found"
    }
  );
};

// ✅ 500 — catches errors thrown inside routes
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);
  res.status(500).json(
    {
      msg: "Internal Server Error"
    }
  );
};


//send errors abruptly
export const createError = (statusCode: number, message: string): Error => {
  const err = new Error(message) as any;
  err.statusCode = statusCode;
  return err;
};