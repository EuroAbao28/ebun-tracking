const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    phoneNo: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^(?:\+639|09)\d{9}$/, 'Invalid phone number format']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['head_admin', 'admin', 'visitor']
    },
    company: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['active', 'inactive', 'pending', 'rejected', 'revoked'],
      default: 'pending'
    },
    loginCount: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imagePublicId: {
      type: String,
      default: ''
    },
    isSoftDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
module.exports = User
