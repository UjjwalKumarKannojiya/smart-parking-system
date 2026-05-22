const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');

const updateOverdueBookings = async () => {
  try {
    const now = new Date();
    const checkedInBookings = await Booking.find({
      status: 'checked_in',
      checkInTime: { $exists: true }
    }).populate('slot');

    let updated = 0;

    for (const booking of checkedInBookings) {
      const diffMs = now - booking.checkInTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      const billableHours = Math.max(1, Math.ceil(diffHours));
      
      if (booking.totalAmount !== billableHours * booking.pricePerHour) {
        booking.totalAmount = billableHours * booking.pricePerHour;
        await booking.save();
        updated++;
      }
    }

    if (updated > 0) {
      console.log(`Updated billing for ${updated} checked-in vehicles`);
    }
  } catch (error) {
    console.error('Billing update error:', error.message);
  }
};

const calculateBilling = (checkInTime, checkOutTime, pricePerHour) => {
  if (!checkInTime || !checkOutTime) {
    return { billableHours: 0, totalAmount: 0 };
  }

  const diffMs = checkOutTime - checkInTime;
  const diffHours = diffMs / (1000 * 60 * 60);
  const billableHours = Math.max(1, Math.ceil(diffHours));
  const totalAmount = billableHours * pricePerHour;

  return {
    billableHours,
    totalAmount
  };
};

module.exports = { updateOverdueBookings, calculateBilling };
