const mongoose = require('mongoose')

const driverSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'Firstname is required'],
      trim: true,
      minlength: [2, 'Firstname must be at least 2 characters long'],
      maxlength: [50, 'Firstname cannot exceed 50 characters']
    },
    lastname: {
      type: String,
      required: [true, 'Lastname is required'],
      trim: true,
      minlength: [2, 'Lastname must be at least 2 characters long'],
      maxlength: [50, 'Lastname cannot exceed 50 characters']
    },
    phoneNo: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^(?:\+63|0)9\d{9}$/, 'Invalid phone number format']
    },
    licenseNo: {
      type: String,
      trim: true,
      maxlength: [20, 'License No. cannot exceed 20 characters']
    },
    imageUrl: {
      type: String,
      default: '' // Cloudinary URL will be stored here
    },
    imagePublicId: {
      type: String,
      default: '' // image id will be stored here
    },
    status: {
      type: String,
      enum: ['available', 'deployed', 'unavailable'],
      default: 'available'
    },
    tripCount: {
      type: Number,
      default: 0
    },
    isSoftDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Driver = mongoose.model('Driver', driverSchema)
module.exports = Driver
