import { Restaurant } from '../model/restaurant.model';
import { SearchParams } from '../validation/restaurant.validation';
import { PipelineStage } from 'mongoose';

export class RestaurantService {
  static async search(params: SearchParams) {
    const { search, cuisine, minRating, maxDeliveryTime, priceRange, isVegetarian, sortBy, page, limit } = params;

    // Rule 1: Default to active only
    const matchStage: any = { isActive: true };

    if (search) matchStage.$text = { $search: search };
    if (cuisine) matchStage.cuisine = cuisine;
    if (minRating) matchStage.rating = { $gte: minRating };
    if (maxDeliveryTime) matchStage.deliveryTime = { $lte: maxDeliveryTime };
    if (priceRange) matchStage.priceRange = priceRange;
    if (isVegetarian !== undefined) matchStage.isVegetarian = isVegetarian;

    // Rule 2: Sorting Logic
    const sortParams: Record<string, 1 | -1> = {};
    if (search) sortParams.score = { $meta: 'textScore' } as any;
    sortParams.isSponsored = -1; 
    if (sortBy === 'rating') sortParams.rating = -1;
    if (sortBy === 'deliveryTime') sortParams.deliveryTime = 1;
    sortParams._id = 1; // Deterministic tie-breaker

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $sort: sortParams },
      { $skip: (page - 1) * limit },
      { $limit: limit }, // Rule 3: Bounded limits
      { 
        $project: { 
          _id: 1, name: 1, cuisine: 1, rating: 1, priceRange: 1, 
          deliveryTime: 1, isVegetarian: 1, isSponsored: 1 
        } 
      }
    ];

    const data = await Restaurant.aggregate(pipeline, { maxTimeMS: 300 }); // Rule 8: 300ms SLA limit
    const totalCount = await Restaurant.countDocuments(matchStage);

    return { data, totalCount };
  }
  static async create(payload: any) {
    // Rule 7: Check duplicates
    const exists = await Restaurant.findOne({ name: payload.name, cuisine: payload.cuisine });
    if (exists) throw new Error('DUPLICATE_ENTRY');
    return await Restaurant.create(payload);
  }

  static async update(id: string, payload: any) {
    // Rule 7: Update whitelisted fields only (handled by Zod in controller)
    const restaurant = await Restaurant.findByIdAndUpdate(id, payload, { new: true });
    if (!restaurant) throw new Error('NOT_FOUND');
    return restaurant;
  }
}