const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { calculateBilling } = require('../middleware/billing');

const router = express.Router();

router.get('/active-bookings', protect, authorize('staff', 'admin'), [
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const bookings = await Booking.find({
      status: { $in: ['active', 'checked_in'] }
    })
      .populate('user', 'name email phone vehicleNumber')
      .populate('slot', 'slotNumber zone floor type')
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments({
      status: { $in: ['active', 'checked_in'] }
    });

    res.json({ 
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings 
    });
  } catch (error) {
    console.error('Get active bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active bookings'
    });
  }
});

router.post('/checkin/:bookingId', protect, authorize('staff', 'admin'), [
  body('notes').optional().trim()
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

    const booking = await Booking.findById(req.params.bookingId).populate('slot');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot check in. Current status: ${booking.status}`
      });
    }

    booking.status = 'checked_in';
    booking.checkInTime = new Date();
    booking.checkedInBy = req.user._id;
    if (req.body.notes) {
      booking.notes = req.body.notes;
    }
    await booking.save();

    await ParkingSlot.findByIdAndUpdate(booking.slot._id, { status: 'occupied' });

    await booking.populate('user', 'name phone vehicleNumber');

    res.json({ 
      success: true, 
      message: `Vehicle ${booking.vehicleNumber} checked in successfully`,
      booking 
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check in vehicle'
    });
  }
});

router.post('/checkout/:bookingId', protect, authorize('staff', 'admin'), [
  body('paymentMethod').isIn(['cash', 'card', 'upi', 'wallet']).withMessage('Invalid payment method'),
  body('notes').optional().trim()
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

    const booking = await Booking.findById(req.params.bookingId).populate('slot').populate('user');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'checked_in') {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle must be checked in before checkout'
      });
    }

    booking.checkOutTime = new Date();
    const { billableHours, totalAmount } = calculateBilling(
      booking.checkInTime,
      booking.checkOutTime,
      booking.pricePerHour
    );

    booking.actualDuration = billableHours;
    booking.totalAmount = totalAmount;
    booking.isPaid = true;
    booking.paymentMethod = req.body.paymentMethod;
    booking.status = 'completed';
    booking.checkedOutBy = req.user._id;
    if (req.body.notes) {
      booking.notes = req.body.notes;
    }
    await booking.save();

    await ParkingSlot.findByIdAndUpdate(booking.slot._id, {
      status: 'available',
      currentBooking: null
    });

    await User.findByIdAndUpdate(booking.user._id, {
      $inc: { totalSpent: totalAmount }
    });

    res.json({
      success: true,
      message: 'Checkout completed successfully',
      bill: {
        bookingId: booking._id,
        slotNumber: booking.slotNumber,
        vehicleNumber: booking.vehicleNumber,
        userName: booking.user.name,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        duration: `${billableHours} hour${billableHours > 1 ? 's' : ''}`,
        pricePerHour: booking.pricePerHour,
        totalAmount,
        paymentMethod: booking.paymentMethod
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete checkout'
    });
  }
});

router.get('/search', protect, authorize('staff', 'admin'), [
  query('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Vehicle number is required',
        errors: errors.array()
      });
    }

    const vehicleNumber = req.query.vehicleNumber.toUpperCase();

    const bookings = await Booking.find({
      vehicleNumber: vehicleNumber,
      status: { $in: ['active', 'checked_in', 'completed'] }
    })
      .populate('user', 'name email phone')
      .populate('slot', 'slotNumber zone floor type')
      .sort('-createdAt')
      .limit(10);

    res.json({ 
      success: true,
      count: bookings.length,
      bookings 
    });
  } catch (error) {
    console.error('Vehicle search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search for vehicle'
    });
  }
});

module.exports = router;
