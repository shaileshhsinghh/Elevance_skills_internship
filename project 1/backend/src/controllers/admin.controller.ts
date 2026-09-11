import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/Order.model';
import { User } from '../models/User.model';

export const getFlaggedOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ flagged: true, adminReview: 'pending' })
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flagged orders' });
  }
};

export const approveOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.adminReview = 'approved';
    order.status = 'approved';
    await order.save();

    res.json({ message: 'Order approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving order' });
  }
};

export const rejectOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.adminReview = 'rejected';
    order.status = 'rejected';
    await order.save();

    res.json({ message: 'Order rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting order' });
  }
};

export const restrictUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isRestricted = true;
    await user.save();

    res.json({ message: 'User restricted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restricting user' });
  }
};