const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['deployment', 'driver', 'truck', 'visitor', 'admin']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    action: {
      type: String,
      required: [true, 'Action is required']
    },
    targetDeployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deployment'
    },
    targetDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    targetTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck'
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('ActivityLog', activityLogSchema)
