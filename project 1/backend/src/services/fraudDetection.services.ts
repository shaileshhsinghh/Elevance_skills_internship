import { Order } from '../models/Order.model';
import { env } from '../config/env';

export class FraudDetectionService {

  static async evaluateOrderRisk(userId: string, couponCode?: string): Promise<{
    riskScore: number;
    flagged: boolean;
    reasons: string[];
  }> {
    let riskScore = 0;
    const reasons: string[] = [];

    const now = Date.now();

    // ─── ORDER FREQUENCY RULES ───────────────────────────────────────

    // Rule 1: More than 3 orders within 10 minutes
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
    const recentOrdersCount = await Order.countDocuments({
      userId,
      createdAt: { $gte: tenMinutesAgo },
    });
    if (recentOrdersCount >= 3) {
      riskScore += 25;
      reasons.push('Rapid ordering: more than 3 orders in 10 minutes');
    }

    // Rule 2: More than 10 orders within 24 hours
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const dailyOrdersCount = await Order.countDocuments({
      userId,
      createdAt: { $gte: oneDayAgo },
    });
    if (dailyOrdersCount >= 10) {
      riskScore += 20;
      reasons.push('Unusually high daily volume: more than 10 orders in 24 hours');
    }

    // ─── CANCELLATION BEHAVIOR RULES ─────────────────────────────────

    // Rule 3: 3 or more cancellations in a single day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyCancellations = await Order.countDocuments({
      userId,
      status: 'cancelled',
      updatedAt: { $gte: startOfDay },
    });
    if (dailyCancellations >= 3) {
      riskScore += 20;
      reasons.push('High daily cancellations: 3 or more cancelled today');
    }

    // Rule 4: Cancellation rate above 70%
    const totalOrders = await Order.countDocuments({ userId });
    const totalCancelled = await Order.countDocuments({ userId, status: 'cancelled' });
    if (totalOrders >= 5) {
      const cancellationRate = totalCancelled / totalOrders;
      if (cancellationRate > 0.7) {
        riskScore += 25;
        reasons.push(`High cancellation rate: ${(cancellationRate * 100).toFixed(0)}%`);
      }
    }

    // Rule 5: Cancelled within 2 minutes of placing, 2+ times
    const quickCancels = await Order.countDocuments({
      userId,
      status: 'cancelled',
      cancelledWithinTwoMinutes: true,
    });
    if (quickCancels >= 2) {
      riskScore += 20;
      reasons.push('Repeated quick cancellations within 2 minutes of placing');
    }

    // ─── COUPON ABUSE RULES ───────────────────────────────────────────

    // Rule 6: Coupon applied more than 3 times in a day
    if (couponCode) {
      const dailyCouponUsage = await Order.countDocuments({
        userId,
        couponCode,
        createdAt: { $gte: startOfDay },
      });
      if (dailyCouponUsage >= 3) {
        riskScore += 20;
        reasons.push('Coupon abuse: same coupon used more than 3 times today');
      }

      // Rule 7: Attempted to use invalid/used coupon more than 2 times
      const invalidCouponAttempts = await Order.countDocuments({
        userId,
        couponCode,
        couponStatus: 'invalid',
      });
      if (invalidCouponAttempts >= 2) {
        riskScore += 15;
        reasons.push('Repeated use of invalid or already-used coupon');
      }
    }

    // ─── REFUND ABUSE RULES ───────────────────────────────────────────

    // Rule 8: More than 2 refund requests in 7-day window
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const recentRefunds = await Order.countDocuments({
      userId,
      refundRequested: true,
      updatedAt: { $gte: sevenDaysAgo },
    });
    if (recentRefunds > 2) {
      riskScore += 20;
      reasons.push('Refund abuse: more than 2 refund requests in 7 days');
    }

    // Rule 9: Refund approval rate above 80%
    const totalRefundRequests = await Order.countDocuments({ userId, refundRequested: true });
    const approvedRefunds = await Order.countDocuments({ userId, refundStatus: 'approved' });
    if (totalRefundRequests >= 3) {
      const refundRate = approvedRefunds / totalRefundRequests;
      if (refundRate > 0.8) {
        riskScore += 25;
        reasons.push(`Serial refunder: refund approval rate at ${(refundRate * 100).toFixed(0)}%`);
      }
    }

    // ─── FINAL VERDICT ────────────────────────────────────────────────

    const threshold = Number(env.RISK_THRESHOLD) || 50;
    const flagged = riskScore >= threshold;

    return { riskScore, flagged, reasons };
  }

  // ─── Called on cancel to check quick-cancel pattern ──────────────
  static async evaluateOnCancel(userId: string, orderId: string): Promise<void> {
    const order = await Order.findById(orderId);
    if (!order) return;

    const timeDiff = (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60; // in minutes

    if (timeDiff <= 2) {
      order.cancelledWithinTwoMinutes = true;
      await order.save();
    }
  }
}