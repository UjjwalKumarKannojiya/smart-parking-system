const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  zone: {
    type: String,
    required: [true, 'Zone is required'],
    enum: ['A', 'B', 'C', 'D'],
    uppercase: true
  },
  type: {
    type: String,
    enum: ['standard', 'compact', 'handicapped', 'ev_charging'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'occupied', 'maintenance'],
    default: 'available'
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  floor: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
