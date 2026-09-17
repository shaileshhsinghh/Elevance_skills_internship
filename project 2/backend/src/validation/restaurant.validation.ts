import { z } from 'zod';

export const searchSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    cuisine: z.enum(['Indian', 'Chinese', 'Italian', 'Mexican', 'American']).optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    maxDeliveryTime: z.coerce.number().int().positive().optional(),
    priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
    isVegetarian: z.enum(['true', 'false', '1', '0'])
      .transform((val) => val === 'true' || val === '1')
      .optional(),
    sortBy: z.enum(['rating', 'deliveryTime', 'price', 'popularity']).default('rating'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  })
});

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    cuisine: z.enum(['Indian', 'Chinese', 'Italian', 'Mexican', 'American']),
    priceRange: z.enum(['$', '$$', '$$$', '$$$$']),
    deliveryTime: z.number().int().positive(),
    isVegetarian: z.boolean(),
    internalCostMargin: z.number().optional()
  })
});

// Partial schema for updates, disallowing auto-computed or core fields like rating
export const updateRestaurantSchema = z.object({
  params: z.object({ restaurantId: z.string() }),
  body: createRestaurantSchema.shape.body.partial().omit({ internalCostMargin: true })
});

export type SearchParams = z.infer<typeof searchSchema>['query'];