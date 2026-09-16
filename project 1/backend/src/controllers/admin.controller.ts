import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/Order.model';
import { User } from '../models/User.model';

export const getFlaggedOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ flagged: true, adminReview: 'pending' })
      .populate('userId', 'email role')
      .sort({ riskScore: -1 }); // highest risk first

    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flagged orders' });
  }
};

export const approveOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.adminReview = 'approved';
    order.status = 'approved';
    await order.save();

    res.json({ message: 'Order approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving order' });
  }
};

export const rejectOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.adminReview = 'rejected';
    order.status = 'rejected';
    await order.save();

    res.json({ message: 'Order rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting order' });
  }
};

export const approveRefund = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.refundRequested) {
      return res.status(400).json({ message: 'No refund request found for this order' });
    }

    order.refundStatus = 'approved';
    order.status = 'refunded';
    await order.save();

    res.json({ message: 'Refund approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving refund' });
  }
};

export const rejectRefund = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!order.refundRequested) {
      return res.status(400).json({ message: 'No refund request found for this order' });
    }

    order.refundStatus = 'rejected';
    await order.save();

    res.json({ message: 'Refund rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting refund' });
  }
};

export const restrictUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isRestricted = true;
    await user.save();

    res.json({ message: 'User restricted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restricting user' });
  }
};