const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const PricingPolicy = require('../models/PricingPolicy');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('user'), [
  body('slotId').notEmpty().withMessage('Slot ID is required'),
  body('vehicleNumber').optional().trim().isLength({ min: 2 }).withMessage('Invalid vehicle number'),
  body('estimatedDuration').optional().isInt({ min: 1, max: 24 }).withMessage('Duration must be between 1 and 24 hours')
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

    const { slotId, vehicleNumber, estimatedDuration } = req.body;

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'active', 'checked_in'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking. Please cancel it first.'
      });
    }

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking slot not found'
      });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        message: `This slot is currently ${slot.status}`
      });
    }

    // Dynamic Pricing Calculation
    let policy = await PricingPolicy.findOne({ isActive: true });
    let finalPricePerHour = slot.pricePerHour; // Fallback

    if (policy) {
      let multiplier = 1.0;
      if (slot.type === 'compact' && policy.multipliers.compact) multiplier = policy.multipliers.compact;
      else if (slot.type === 'ev_charging' && policy.multipliers.ev_charging) multiplier = policy.multipliers.ev_charging;
      else if (slot.type === 'handicapped' && policy.multipliers.handicapped) multiplier = policy.multipliers.handicapped;
      else if (policy.multipliers.standard) multiplier = policy.multipliers.standard;

      // Check if weekend
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        multiplier *= policy.weekendMultiplier || 1.0;
      }

      finalPricePerHour = policy.basePrice * multiplier;
    }

    const booking = await Booking.create({
      user: req.user._id,
      slot: slotId,
      slotNumber: slot.slotNumber,
      vehicleNumber: vehicleNumber ? vehicleNumber.toUpperCase() : req.user.vehicleNumber,
      estimatedDuration: estimatedDuration || 1,
      pricePerHour: finalPricePerHour,
      totalAmount: finalPricePerHour * (estimatedDuration || 1),
      status: 'active'
    });

    slot.status = 'booked';
    slot.currentBooking = booking._id;
    await slot.save();

    await booking.populate('slot', 'slotNumber zone floor type pricePerHour');

    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      booking 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('slot', 'slotNumber zone floor type pricePerHour')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({ 
      success: true,
      count: bookings.length,
      total,
      bookings 
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings'
    });
  }
});

router.get('/active', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'active', 'checked_in'] }
    }).populate('slot', 'slotNumber zone floor type pricePerHour');

    res.json({ 
      success: true, 
      booking 
    });
  } catch (error) {
    console.error('Get active booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active booking'
    });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found'
      });
    }

    if (booking.status === 'checked_in') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel after check-in. Contact support for assistance.'
      });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Booking is already ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    await ParkingSlot.findByIdAndUpdate(booking.slot, {
      status: 'available',
      currentBooking: null
    });

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel booking'
    });
  }
});

router.get('/', protect, authorize('admin'), [
  query('status').optional().isIn(['pending', 'active', 'checked_in', 'completed', 'cancelled']).withMessage('Invalid status'),
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
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone vehicleNumber')
      .populate('slot', 'slotNumber zone floor type')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filter);

    res.json({ 
      success: true, 
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings 
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings'
    });
  }
});

module.exports = router;
