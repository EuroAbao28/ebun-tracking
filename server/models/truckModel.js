const mongoose = require('mongoose')

const truckSchema = new mongoose.Schema(
  {
    plateNo: {
      type: String,
      required: [true, 'Plate No. is required'],
      trim: true,
      minlength: [2, 'Plate No. must be at least 2 characters long'],
      maxlength: [7, 'Plate No. cannot exceed 7 characters']
    },
    truckType: {
      type: String,
      enum: [
        'single-tire',
        'elf',
        'forward',
        '10-wheeler',
        '12-wheeler',
        'wing-van',
        'L300',
        'multicab'
      ]
    },
    status: {
      type: String,
      enum: ['available', 'deployed', 'unavailable'],
      default: 'available'
    },
    imageUrl: {
      type: String,
      default: '' // cloudinary URL will be stored here
    },
    imagePublicId: {
      type: String,
      default: '' // image id will be stored here
    },

    isSoftDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Truck = mongoose.model('Truck', truckSchema)
module.exports = Truck
