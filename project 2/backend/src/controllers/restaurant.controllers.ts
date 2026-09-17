// src/controllers/admin.restaurant.controller.ts
import { Request, Response } from 'express';
import { createRestaurantSchema, updateRestaurantSchema } from '../validation/restaurant.validation';
import { RestaurantService } from '../services/restaurant.services';
import { sendResponse } from '../utils/response.util';

/**
 * @desc    Create a new restaurant
 * @route   POST /api/admin/restaurants/create
 * @access  Private (Admin only - Protected by JWT Middleware)
 */
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    // 1. Validate request body against strict Zod schema
    const { body } = createRestaurantSchema.parse(req);

    // 2. Pass to service (Service rule: checks for duplicate before insertion)
    const newRestaurant = await RestaurantService.create(body);

    // 3. Return 201 Created with standard envelope
    return sendResponse(res, 201, newRestaurant, null, null);

  } catch (error: any) {
    // Handle Zod Validation Errors
    if (error.name === 'ZodError') {
      return sendResponse(res, 400, null, null, {
        message: 'Validation failed for restaurant creation',
        errorCode: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    // Handle Duplicate Entry Error (Thrown by RestaurantService)
    if (error.message === 'DUPLICATE_ENTRY') {
      return sendResponse(res, 409, null, null, {
        message: 'A restaurant with this name and cuisine already exists.',
        errorCode: 'DUPLICATE_RESOURCE'
      });
    }

    console.error('Error creating restaurant:', error);
    return sendResponse(res, 500, null, null, {
      message: 'Internal server error during creation',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

/**
 * @desc    Update an existing restaurant
 * @route   PUT /api/admin/restaurants/update/:restaurantId
 * @access  Private (Admin only - Protected by JWT Middleware)
 */
export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    // 1. Validate both the dynamic URL parameter and the request body
    // Rule 7: Zod automatically strips non-whitelisted fields and strictly omits computed fields like 'rating'
    const { params, body } = updateRestaurantSchema.parse({
      params: req.params,
      body: req.body
    });

    // 2. Pass ID and safe body to service
    const updatedRestaurant = await RestaurantService.update(params.restaurantId, body);

    // 3. Return updated data
    return sendResponse(res, 200, updatedRestaurant, null, null);

  } catch (error: any) {
    // Handle Zod Validation Errors (e.g., malformed ID or invalid update fields)
    if (error.name === 'ZodError') {
      return sendResponse(res, 400, null, null, {
        message: 'Validation failed for restaurant update',
        errorCode: 'VALIDATION_ERROR',
        details: error.errors
      });
    }

    // Handle Not Found Error (Thrown by RestaurantService if ID doesn't exist)
    if (error.message === 'NOT_FOUND') {
      return sendResponse(res, 404, null, null, {
        message: `Restaurant with ID ${req.params.restaurantId} not found.`,
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Handle invalid MongoDB ObjectId errors specifically
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return sendResponse(res, 400, null, null, {
        message: 'Invalid restaurant ID format.',
        errorCode: 'INVALID_ID_FORMAT'
      });
    }

    console.error('Error updating restaurant:', error);
    return sendResponse(res, 500, null, null, {
      message: 'Internal server error during update',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};