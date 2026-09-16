import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/Order.model';
import { FraudDetectionService } from '../services/fraudDetection.services';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { items, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity, 0
    );

    const { riskScore, flagged, reasons } = await FraudDetectionService.evaluateOrderRisk(
      String(userId),
      couponCode
    );

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      couponCode,
      couponStatus: couponCode ? 'valid' : undefined,
      riskScore,
      flagged,
      reasons,
      status: flagged ? 'pending' : 'approved',
      adminReview: flagged ? 'pending' : 'approved',
      refundRequested: false,
      cancelledWithinTwoMinutes: false,
    });

    res.status(201).json({
      order,
      message: flagged
        ? `Order flagged for review. Reasons: ${reasons.join(', ')}`
        : 'Order created successfully',
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['cancelled', 'rejected'].includes(order.status)) {
      return res.status(400).json({ message: 'Order already cancelled or rejected' });
    }

    order.status = 'cancelled';
    await order.save();

    // Check if this was a quick cancel (within 2 min)
    await FraudDetectionService.evaluateOnCancel(String(userId), String(orderId));

    res.json({ message: 'Order cancelled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

export const requestRefund = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.refundRequested) {
      return res.status(400).json({ message: 'Refund already requested for this order' });
    }

    if (order.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved orders can be refunded' });
    }

    order.refundRequested = true;
    order.refundStatus = 'pending';
    await order.save();

    res.json({ message: 'Refund request submitted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error requesting refund' });
  }
};