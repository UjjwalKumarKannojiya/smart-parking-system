const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const PricingPolicy = require('../models/PricingPolicy');
const { protect, authorize } = require('../middleware/auth');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

// --- Pricing Policy Management ---

router.get('/pricing-policy', async (req, res, next) => {
  try {
    let policy = await PricingPolicy.findOne({ isActive: true });
    if (!policy) {
      // Create a default if it doesn't exist
      policy = await PricingPolicy.create({});
    }
    res.json({ success: true, policy });
  } catch (error) {
    next(error);
  }
});

router.put('/pricing-policy', [
  body('basePrice').optional().isNumeric(),
  body('multipliers').optional().isObject(),
  body('weekendMultiplier').optional().isNumeric()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let policy = await PricingPolicy.findOne({ isActive: true });
    if (!policy) {
      policy = new PricingPolicy();
    }

    if (req.body.basePrice !== undefined) policy.basePrice = req.body.basePrice;
    if (req.body.multipliers) {
      policy.multipliers = { ...policy.multipliers, ...req.body.multipliers };
    }
    if (req.body.weekendMultiplier !== undefined) policy.weekendMultiplier = req.body.weekendMultiplier;

    await policy.save();
    
    res.json({
      success: true,
      message: 'Pricing policy updated successfully',
      policy
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalSlots,
      availableSlots,
      occupiedSlots,
      bookedSlots,
      totalUsers,
      totalStaff,
      totalBookings,
      activeBookings,
      completedBookings,
      todayRevenue,
      monthRevenue,
      recentBookings,
      topUsers
    ] = await Promise.all([
      ParkingSlot.countDocuments({ isActive: true }),
      ParkingSlot.countDocuments({ status: 'available', isActive: true }),
      ParkingSlot.countDocuments({ status: 'occupied', isActive: true }),
      ParkingSlot.countDocuments({ status: 'booked', isActive: true }),
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'staff', isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['active', 'checked_in'] } }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.find({ status: 'completed' })
        .populate('user', 'name email vehicleNumber')
        .populate('slot', 'slotNumber zone type')
        .sort('-createdAt')
        .limit(10),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$user', total: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
      ])
    ]);

    res.json({
      success: true,
      dashboard: {
        slots: {
          total: totalSlots,
          available: availableSlots,
          occupied: occupiedSlots,
          booked: bookedSlots
        },
        users: {
          total: totalUsers,
          staff: totalStaff
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings
        },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          month: monthRevenue[0]?.total || 0
        },
        recentBookings,
        topUsers
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data'
    });
  }
});

router.get('/users', [
  query('role').optional().isIn(['user', 'staff', 'admin']).withMessage('Invalid role'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({ 
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users'
    });
  }
});

router.post('/users', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('role').isIn(['staff', 'admin']).withMessage('Role must be staff or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }

    const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use'
      });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      phone: req.body.phone,
      role: req.body.role
    });

    res.status(201).json({ 
      success: true,
      message: `${req.body.role} user created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user'
    });
  }
});

router.put('/users/:id', [
  body('role').optional().isIn(['staff', 'admin', 'user']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user'
    });
  }
});

router.put('/slots/:id/price', [
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { pricePerHour: req.body.pricePerHour },
      { new: true, runValidators: true }
    );

    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking slot not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Slot price updated successfully',
      slot 
    });
  } catch (error) {
    console.error('Update slot price error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update slot price'
    });
  }
});

router.get('/revenue', [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const period = req.query.period || 'month';
    const now = new Date();
    let startDate;

    if (period === 'day') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed', 
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = revenueData.reduce((sum, d) => sum + d.bookings, 0);

    res.json({ 
      success: true,
      period,
      summary: {
        totalRevenue,
        totalBookings,
        averagePerBooking: totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0
      },
      data: revenueData
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue data'
    });
  }
});

module.exports = router;
