const mongoose = require('mongoose')

const deploymentSchema = new mongoose.Schema(
  {
    deploymentCode: {
      type: String,
      unique: true,
      index: true
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: [true, 'Truck is required']
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required']
    },
    truckType: {
      type: String,
      required: [true, 'Truck type is required']
    },
    helperCount: {
      type: String,
      required: [true, 'Helper count is required']
    },
    pickupSite: {
      type: String,
      required: [true, 'Pick-up site is required']
    },
    destination: {
      type: String,
      required: [true, 'Destination is required']
    },
    sacksCount: {
      type: Number,
      default: 0
    },
    loadWeightKg: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'preparing'
    },
    replacement: {
      replacementTruckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Truck'
      },
      replacementDriverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
      },
      replacementTruckType: String,
      replacementHelperCount: Number,
      replacedAt: String,
      reason: String,
      remarks: String
    },
    departed: {
      type: String,
      default: ''
    },
    pickupIn: {
      type: String,
      default: ''
    },
    pickupOut: {
      type: String,
      default: ''
    },
    destArrival: {
      type: String,
      default: ''
    },
    destDeparture: {
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

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
})

const Counter = mongoose.model('Counter', counterSchema)

// Format: DP241200001 (DP + YYMM + 5-digit sequence)
deploymentSchema.pre('save', async function (next) {
  if (!this.deploymentCode) {
    try {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2) // "24"
      const month = String(now.getMonth() + 1).padStart(2, '0') // "01" to "12"

      const monthKey = `${year}${month}` // "2412" for Dec 2024
      const counterId = `deployment-${monthKey}`

      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      )

      // Format: DP241200001
      this.deploymentCode = `DP${monthKey}${String(counter.seq).padStart(
        5,
        '0'
      )}`

      next()
    } catch (error) {
      next(error)
    }
  } else {
    next()
  }
})

const Deployment = mongoose.model('Deployment', deploymentSchema)
module.exports = Deployment
