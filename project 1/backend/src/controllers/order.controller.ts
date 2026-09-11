import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/Order.model';
import { FraudDetectionService } from '../services/fraudDetection.services';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { items, couponCode } = req.body;

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // Evaluate risk
    const { riskScore, flagged } = await FraudDetectionService.evaluateOrderRisk(String(userId));

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      couponCode,
      riskScore,
      flagged,
      status: flagged ? 'pending' : 'approved', // if flagged, wait for admin
      adminReview: flagged ? 'pending' : 'approved',
    });

    res.status(201).json({
      order,
      message: flagged ? 'Order flagged for review' : 'Order created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' });
    }

    // Update status
    order.status = 'cancelled';
    await order.save();

    // Optionally re-evaluate risk for future orders (not required)
    await FraudDetectionService.evaluateOnCancel(String(userId));

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
};