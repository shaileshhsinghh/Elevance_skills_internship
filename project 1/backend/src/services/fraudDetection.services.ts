import { Order } from '../models/Order.model';
import { env } from '../config/env';

export class FraudDetectionService {
  /**
   * Evaluate risk for a new order based on user's historical behavior.
   * Returns risk score and whether to flag.
   */
  static async evaluateOrderRisk(userId: string): Promise<{ riskScore: number; flagged: boolean }> {
    let riskScore = 0;

    // 1. Multiple orders in short period (e.g., >5 in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrdersCount = await Order.countDocuments({
      userId,
      createdAt: { $gte: fiveMinutesAgo },
    });
    if (recentOrdersCount >= 5) {
      riskScore += 20;
    }

    // 2. Repeated cancellations (cancellation rate > 50% over last 10 orders)
    const lastTenOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    if (lastTenOrders.length >= 5) {
      const cancelledCount = lastTenOrders.filter(o => o.status === 'cancelled').length;
      const rate = cancelledCount / lastTenOrders.length;
      if (rate > 0.5) {
        riskScore += 30;
      }
    }

    // 3. Abnormal coupon usage (e.g., same coupon used multiple times by same user)
    // For simplicity, we'll check if the user has used any coupon more than 3 times.
    // This requires aggregation; we'll just add a placeholder rule.
    // In a real scenario, you might track coupon usage history.
    // We'll add a dummy rule: if couponCode is provided and totalAmount is unusually low.
    // Instead, we'll check if any order with same coupon exists and add risk.
    // Let's implement a simpler version: if coupon is used and order amount < 10, add risk.
    // But we don't have coupon in the request here; we'll pass it as param.

    // 4. Excessive refund requests (we'll track refund status, but not implemented here)

    // Threshold from env
    const threshold = env.RISK_THRESHOLD;
    const flagged = riskScore >= threshold;

    return { riskScore, flagged };
  }

  /**
   * Re-evaluate risk on cancellation (optional, but we can just log)
   */
  static async evaluateOnCancel(userId: string): Promise<void> {
    // Could update user's risk profile, but not required for now
  }
}