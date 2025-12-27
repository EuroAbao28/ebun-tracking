const createError = require('http-errors')
const sharp = require('sharp')
const Truck = require('../models/truckModel')
const { validateFields } = require('../utils/validationFields')
const { isValidFileType } = require('../utils/validationFile')
const {
  validateCondition,
  validateStatus,
  validateType
} = require('../utils/validationTruckFields')
const { uploadImageToCloudinary } = require('../utils/cloudinaryUtils')
const { cloudinary } = require('../middlewares/multerCloudinary')
const ActivityLog = require('../models/activityLogsModel')

// create truck
const createTruck = async (req, res, next) => {
  try {
    const { plateNo, truckType, maxLoad, status } = req.body

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // validate fields
    validateFields(plateNo)

    // validate other fields
    validateType(truckType)
    validateStatus(status)

    // check if truck with same plate number already exists
    const isTruckAlreadyExist = await Truck.findOne({
      plateNo: { $regex: new RegExp(`^${plateNo}$`, 'i') }
    })

    if (isTruckAlreadyExist) {
      return next(
        createError(409, 'Truck with this plate number already exists')
      )
    }

    // upload profile picture to cloudinary (if provided)
    let imageData = {
      url: '',
      publicId: ''
    }

    if (req.file) {
      console.log(req.file)

      try {
        // validate file type
        if (!isValidFileType(req.file.mimetype)) {
          return next(
            createError(400, 'Invalid file type. Only images are allowed')
          )
        }

        // compress the image with sharp
        const compressedImage = await sharp(req.file.buffer)
          .rotate()
          .resize({
            width: 1200,
            withoutEnlargement: true
          })
          .jpeg({
            quality: 80,
            mozjpeg: true
          })
          .toBuffer()

        // upload the image to cloudinary
        const uploadResult = await uploadImageToCloudinary(
          compressedImage,
          'Ebun/truck'
        )

        imageData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      } catch (error) {
        return next(error)
      }
    }

    // create new truck
    const newTruck = await Truck.create({
      plateNo,
      truckType,
      maxLoad,
      status,
      imageUrl: imageData.url,
      imagePublicId: imageData.publicId
    })

    // create activity log
    await ActivityLog.create({
      type: 'truck',
      performedBy: req.user._id,
      action: 'Created new truck',
      targetTruck: newTruck._id
    })

    return res.status(201).json({
      message: 'Truck created successfully',
      truck: newTruck
    })
  } catch (error) {
    next(error)
  }
}

// get trucks
const getAllTrucks = async (req, res, next) => {
  try {
    const {
      truckType,
      status,
      search,
      sort,
      perPage,
      page = 1,
      showDeleted
    } = req.query

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    const query = {}

    if (showDeleted !== 'true') {
      query.$or = [
        { isSoftDeleted: false },
        { isSoftDeleted: { $exists: false } }
      ]
    }

    //  filters
    if (truckType) query.truckType = truckType
    if (status) query.status = status

    // search
    if (search) {
      const regex = { $regex: search, $options: 'i' }
      query.$or = [{ plateNo: regex }]
    }

    // sorting
    const sortOptions = {
      oldest: { createdAt: 1 },
      latest: { createdAt: -1 },
      'a-z': { plateNo: 1 },
      'z-a': { plateNo: -1 }
    }

    const sortQuery = sortOptions[sort] || sortOptions.latest

    // check if pagination parameters are provided
    const hasPagination =
      perPage !== undefined &&
      perPage !== '' &&
      !isNaN(parseInt(perPage)) &&
      page !== undefined &&
      page !== '' &&
      !isNaN(parseInt(page))

    if (hasPagination) {
      console.log('WITH PAGINATION')
      // With pagination
      const limit = parseInt(perPage)
      const skip = (parseInt(page) - 1) * limit

      const [total, trucks] = await Promise.all([
        Truck.countDocuments(query),
        Truck.find(query).skip(skip).limit(limit).sort(sortQuery)
      ])

      return res.status(200).json({
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        trucks
      })
    } else {
      console.log('NO PAGINATION')

      // Without pagination - get all trucks
      const trucks = await Truck.find(query).sort(sortQuery)

      return res.status(200).json({
        trucks
      })
    }
  } catch (error) {
    next(error)
  }
}

// update truck
const updateTruck = async (req, res, next) => {
  try {
    const { id } = req.params
    const { plateNo, truckType, status, maxLoad } = req.body

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    console.log('UPDATE TRUCK BODY', req.body)

    // find the truck
    const existingTruck = await Truck.findById(id)
    if (!existingTruck) {
      return next(createError(404, 'Truck not found'))
    }

    // handle file upload if provided
    let imageUrl = existingTruck.imageUrl
    let imagePublicId = existingTruck.imagePublicId

    // if images are provided
    if (req.file) {
      console.log('IMAGE FOR UPDATE', req.file)

      try {
        // validate file type
        if (!isValidFileType(req.file.mimetype)) {
          return next(
            createError(400, 'Invalid file type. Only images are allowed')
          )
        }

        // Validate file size (16MB max)
        const MAX_FILE_SIZE = 16 * 1024 * 1024
        if (req.file.size > MAX_FILE_SIZE) {
          return next(createError(400, 'Image size must be less than 16MB'))
        }

        // delete old picture if exist
        if (imagePublicId) {
          await cloudinary.uploader.destroy(imagePublicId)
        }

        // upload new image
        const uploadResult = await uploadImageToCloudinary(
          req.file.buffer,
          'Ebun/truck'
        )

        imageUrl = uploadResult.secure_url
        imagePublicId = uploadResult.public_id
      } catch (error) {
        console.error('Cloudinary error:', error)
        return next(createError(500, 'Failed to upload image'))
      }
    }

    const updatedFields = []
    if (plateNo && plateNo !== existingTruck.plateNo)
      updatedFields.push('plate number')
    if (truckType && truckType !== existingTruck.truckType)
      updatedFields.push('truck type')
    if (status && status !== existingTruck.status) updatedFields.push('status')
    if (maxLoad && maxLoad !== existingTruck.maxLoad)
      updatedFields.push('maximum load')

    const actionMessage =
      updatedFields.length > 0
        ? `Updated truck's ${updatedFields.join(', ')}`
        : 'Updated truck details'

    // update fields
    const updatedFieldsData = {
      plateNo: plateNo || existingTruck.plateNo,
      truckType: truckType ?? existingTruck.truckType,
      status: status || existingTruck.status,
      maxLoad: maxLoad || existingTruck.maxLoad,
      imageUrl,
      imagePublicId
    }

    Object.assign(existingTruck, updatedFieldsData)
    await existingTruck.save()

    // create activity log
    await ActivityLog.create({
      type: 'truck',
      performedBy: req.user._id,
      action: actionMessage,
      targetDriver: existingTruck._id
    })

    res.status(200).json({
      message: 'Truck updated successfully',
      truck: existingTruck
    })
  } catch (error) {
    next(error)
  }
}

// delete truck
const hardDeleteTruck = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Find the truck to delete
    const truckToDelete = await Truck.findByIdAndDelete(id)
    if (!truckToDelete) {
      return next(createError(404, 'Truck not found'))
    }

    // Delete profile picture from Cloudinary if it exists
    if (truckToDelete.imagePublicId) {
      await cloudinary.uploader.destroy(truckToDelete.imagePublicId)
    }

    return res.status(200).json({
      message: 'Truck deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting truck:', error)
    next(createError(500, 'Failed to delete truck'))
  }
}

const softDeleteTruck = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Find the truck
    const truck = await Truck.findById(id)
    if (!truck) {
      return next(createError(404, 'Truck not found'))
    }

    // Check if already deleted
    if (truck.isSoftDeleted) {
      return next(createError(400, 'Truck is already deleted'))
    }

    // Soft delete the truck
    truck.isSoftDeleted = true

    await truck.save()

    // create activity log
    await ActivityLog.create({
      type: 'truck',
      performedBy: req.user._id,
      action: 'Deleted a truck',
      targetDriver: truck._id
    })

    res.status(200).json({
      success: true,
      message: 'Truck deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createTruck,
  getAllTrucks,
  updateTruck,
  hardDeleteTruck,
  softDeleteTruck
}
