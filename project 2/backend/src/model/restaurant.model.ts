import { Schema, model, Document } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  cuisine: 'Indian' | 'Chinese' | 'Italian' | 'Mexican' | 'American';
  rating: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  deliveryTime: number;
  isVegetarian: boolean;
  isActive: boolean;
  isSponsored: boolean;
  internalCostMargin?: number;
}

const restaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  cuisine: { type: String, required: true, enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'American'] },
  rating: { type: Number, required: true, min: 1, max: 5, default: 1 },
  priceRange: { type: String, required: true, enum: ['$', '$$', '$$$', '$$$$'] },
  deliveryTime: { type: Number, required: true },
  isVegetarian: { type: Boolean, required: true },
  isActive: { type: Boolean, default: true },
  isSponsored: { type: Boolean, default: false },
  internalCostMargin: { type: Number, select: false } // Rule 6: Hidden from public
}, { timestamps: true });

// Rule 3: Text index & Compound Indexes
restaurantSchema.index({ name: 'text', cuisine: 'text' });
restaurantSchema.index({ cuisine: 1, rating: -1, isActive: 1 });
restaurantSchema.index({ rating: -1, _id: 1 }); // Secondary sort tie-breaker

export const Restaurant = model<IRestaurant>('Restaurant', restaurantSchema);