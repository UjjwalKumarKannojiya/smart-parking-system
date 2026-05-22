const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  slotNumber: { type: String },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'checked_in', 'completed', 'cancelled'],
    default: 'pending'
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  estimatedDuration: {
    type: Number, // hours
    default: 1
  },
  actualDuration: {
    type: Number, // hours (calculated on checkout)
    default: null
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash'
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: { type: String }
}, { timestamps: true });

// ─── Calculate billing on checkout ──────────────────────────────────────────
bookingSchema.methods.calculateBill = function () {
  if (!this.checkInTime || !this.checkOutTime) return 0;

  const diffMs = this.checkOutTime - this.checkInTime;
  const diffHours = diffMs / (1000 * 60 * 60);

  // Minimum 1 hour charge
  const billableHours = Math.max(1, Math.ceil(diffHours));
  this.actualDuration = billableHours;
  this.totalAmount = billableHours * this.pricePerHour;
  return this.totalAmount;
};

// ─── Prevent double booking index ─────────────────────────────────────────────
bookingSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'active', 'checked_in'] } }
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
