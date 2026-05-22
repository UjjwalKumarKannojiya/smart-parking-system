const express = require('express');
const { query, body, validationResult } = require('express-validator');
const ParkingSlot = require('../models/ParkingSlot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, [
  query('zone').optional().isIn(['A', 'B', 'C', 'D']).withMessage('Invalid zone'),
  query('status').optional().isIn(['available', 'booked', 'occupied', 'maintenance']).withMessage('Invalid status'),
  query('type').optional().isIn(['standard', 'compact', 'handicapped', 'ev_charging']).withMessage('Invalid type')
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

    const filter = { isActive: true };

    if (req.query.zone) filter.zone = req.query.zone.toUpperCase();
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const slots = await ParkingSlot.find(filter)
      .populate('currentBooking', 'vehicleNumber checkInTime')
      .sort('zone slotNumber');

    const summary = {
      total: slots.length,
      available: slots.filter(s => s.status === 'available').length,
      booked: slots.filter(s => s.status === 'booked').length,
      occupied: slots.filter(s => s.status === 'occupied').length,
      maintenance: slots.filter(s => s.status === 'maintenance').length
    };

    res.json({ 
      success: true, 
      summary,
      slots 
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch parking slots'
    });
  }
});

router.get('/available', protect, async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ 
      status: 'available', 
      isActive: true 
    })
      .sort('zone slotNumber');

    res.json({ 
      success: true, 
      count: slots.length,
      slots 
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available slots'
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id).populate('currentBooking');
    
    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking slot not found'
      });
    }

    res.json({ 
      success: true, 
      slot 
    });
  } catch (error) {
    console.error('Get slot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch slot details'
    });
  }
});

router.post('/', protect, authorize('admin'), [
  body('slotNumber').trim().notEmpty().withMessage('Slot number is required'),
  body('zone').isIn(['A', 'B', 'C', 'D']).withMessage('Zone must be A, B, C, or D'),
  body('type').isIn(['standard', 'compact', 'handicapped', 'ev_charging']).withMessage('Invalid slot type'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  body('floor').isInt({ min: 1 }).withMessage('Floor must be a positive number')
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

    const { slotNumber, zone, type, pricePerHour, floor } = req.body;

    const slotExists = await ParkingSlot.findOne({ slotNumber: slotNumber.toUpperCase() });
    if (slotExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slot number already exists'
      });
    }

    const slot = await ParkingSlot.create({
      slotNumber: slotNumber.toUpperCase(),
      zone: zone.toUpperCase(),
      type,
      pricePerHour,
      floor
    });

    res.status(201).json({ 
      success: true, 
      message: 'Parking slot created',
      slot 
    });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create parking slot'
    });
  }
});

router.put('/:id', protect, authorize('admin'), [
  body('status').optional().isIn(['available', 'booked', 'occupied', 'maintenance']).withMessage('Invalid status'),
  body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  body('type').optional().isIn(['standard', 'compact', 'handicapped', 'ev_charging']).withMessage('Invalid slot type')
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
      req.body,
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
      message: 'Slot updated successfully',
      slot 
    });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update parking slot'
    });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking slot not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Parking slot deactivated successfully'
    });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to deactivate parking slot'
    });
  }
});

module.exports = router;
