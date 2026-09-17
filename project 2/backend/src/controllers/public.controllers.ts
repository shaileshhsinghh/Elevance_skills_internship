// src/controllers/public.controller.ts
import { Request, Response } from 'express';
import { searchSchema } from '../validation/restaurant.validation';
import { RestaurantService } from '../services/restaurant.services';
import { sendResponse } from '../utils/response.util';

export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const parsed = searchSchema.parse(req);
    const { data, totalCount } = await RestaurantService.search(parsed.query);

    return sendResponse(res, 200, data, {
      page: parsed.query.page,
      limit: parsed.query.limit,
      total: totalCount
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return sendResponse(res, 400, null, null, { message: 'Validation failed', errorCode: 'VALIDATION_ERROR', details: error.errors });
    }
    return sendResponse(res, 500, null, null, { message: 'Server Error', errorCode: 'INTERNAL_ERROR' });
  }
};
