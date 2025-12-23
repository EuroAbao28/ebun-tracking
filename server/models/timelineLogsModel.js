const mongoose = require('mongoose')

const timelineLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    action: {
      type: String,
      required: [true, 'Action is required']
    },
    status: {
      type: String,
      enum: ['preparing', 'ongoing', 'completed', 'canceled'],
      required: [true, 'Action status is required']
    },
    timestamp: {
      type: Date,
      required: [true, 'Date and time is required']
    },
    targetDeployment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deployment'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('TimelineLog', timelineLogSchema)
