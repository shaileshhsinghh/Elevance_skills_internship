import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;

  // Coupon
  couponCode?: string;
  couponStatus?: 'valid' | 'invalid';

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  adminReview?: 'pending' | 'approved' | 'rejected';

  // Fraud
  riskScore: number;
  flagged: boolean;
  reasons: string[];

  // Cancellation
  cancelledWithinTwoMinutes: boolean;

  // Refund
  refundRequested: boolean;
  refundStatus?: 'pending' | 'approved' | 'rejected';

  // Timestamps (auto by mongoose)
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    // ─── Coupon ───────────────────────────────────────────
    couponCode: {
      type: String,
    },
    couponStatus: {
      type: String,
      enum: ['valid', 'invalid'],
    },

    // ─── Status ───────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded'],
      default: 'pending',
    },
    adminReview: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // ─── Fraud Detection ──────────────────────────────────
    riskScore: {
      type: Number,
      default: 0,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    reasons: {
      type: [String],
      default: [],
    },

    // ─── Cancellation ─────────────────────────────────────
    cancelledWithinTwoMinutes: {
      type: Boolean,
      default: false,
    },

    // ─── Refund ───────────────────────────────────────────
    refundRequested: {
      type: Boolean,
      default: false,
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);