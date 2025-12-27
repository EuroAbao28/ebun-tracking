const Driver = require('../models/driverModel')
const createError = require('http-errors')
const sharp = require('sharp')
const { isValidFileType } = require('../utils/validationFile')
const { uploadImageToCloudinary } = require('../utils/cloudinaryUtils')
const { validateFields } = require('../utils/validationFields')
const { cloudinary } = require('../middlewares/multerCloudinary')
const ActivityLog = require('../models/activityLogsModel')

// create driver
const createDriver = async (req, res, next) => {
  try {
    const { firstname, lastname, phoneNo, status, licenseNo } = req.body

    if (!['head_admin', 'admin', 'visitor'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // validate fields
    validateFields(
      {
        firstname,
        lastname,
        phoneNo,
        status
      },
      false
    )
    // check if driver already exist
    const isDriverAlreadyExist = await Driver.findOne({
      firstname: { $regex: new RegExp(`^${firstname}$`, 'i') },
      lastname: { $regex: new RegExp(`^${lastname}$`, 'i') }
    })

    if (isDriverAlreadyExist) {
      return res.status(400).json({
        message: 'Driver with this firstname and lastname already exists'
      })
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
          'Ebun/driver'
        )

        imageData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      } catch (error) {
        return next(error)
      }
    }

    // create new driver
    const newDriver = await Driver.create({
      firstname,
      lastname,
      phoneNo,
      status,
      licenseNo,
      imageUrl: imageData.url,
      imagePublicId: imageData.publicId
    })

    // create activity log
    await ActivityLog.create({
      type: 'driver',
      performedBy: req.user._id,
      action: 'Created new driver',
      targetDriver: newDriver._id
    })

    return res.status(201).json({
      message: 'Driver created successfully',
      driver: newDriver
    })
  } catch (error) {
    next(error)
  }
}

// test driver
const getAllDrivers = async (req, res, next) => {
  try {
    const { status, sort, search, perPage, page = 1, showDeleted } = req.query

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
    if (status) query.status = status

    // search
    if (search) {
      const regex = { $regex: search, $options: 'i' }
      query.$or = [
        { firstname: regex },
        { lastname: regex },
        { phoneNo: regex }
      ]
    }

    // pagination
    const limit = parseInt(perPage)
    const skip = (parseInt(page) - 1) * limit

    // sorting
    const sortOptions = {
      oldest: { createdAt: 1 },
      latest: { createdAt: -1 },
      'a-z': { firstname: 1 },
      'z-a': { firstname: -1 },
      'trips-high': { tripCount: -1 },
      'trips-low': { tripCount: 1 }
    }

    const sortQuery = sortOptions[sort] || sortOptions.latest

    // query databas
    const [total, drivers] = await Promise.all([
      Driver.countDocuments(query),
      Driver.find(query).skip(skip).limit(limit).sort(sortQuery)
    ])

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      drivers
    })
  } catch (error) {
    next(error)
  }
}

// update driver
const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params
    const { firstname, lastname, phoneNo, status, licenseNo, tripCount } =
      req.body

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    console.log(req.body)

    // find the driver
    const existingDriver = await Driver.findById(id)
    if (!existingDriver) {
      return next(createError(404, 'Driver not found'))
    }

    // handle file upload if provided
    let imageUrl = existingDriver.imageUrl
    let imagePublicId = existingDriver.imagePublicId

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
          'Ebun/driver'
        )

        imageUrl = uploadResult.secure_url
        imagePublicId = uploadResult.public_id
      } catch (error) {
        console.error('Cloudinary error:', error)
        return next(createError(500, 'Failed to upload image'))
      }
    }

    // Track which fields are being updated for activity log
    const updatedFields = []
    if (firstname && firstname !== existingDriver.firstname)
      updatedFields.push('firstname')
    if (lastname && lastname !== existingDriver.lastname)
      updatedFields.push('lastname')
    if (phoneNo && phoneNo !== existingDriver.phoneNo)
      updatedFields.push('phone number')
    if (status && status !== existingDriver.status) updatedFields.push('status')
    if (licenseNo && licenseNo !== existingDriver.licenseNo)
      updatedFields.push('license number')
    if (tripCount && parseInt(tripCount) !== existingDriver.tripCount)
      updatedFields.push('trip count')
    if (req.file) updatedFields.push('profile picture')

    const actionMessage =
      updatedFields.length > 0
        ? `Updated driver's ${updatedFields.join(', ')}`
        : 'Updated driver details'

    // update fields
    const updatedFieldsData = {
      firstname: firstname || existingDriver.firstname,
      lastname: lastname || existingDriver.lastname,
      phoneNo: phoneNo || existingDriver.phoneNo,
      status: status || existingDriver.status,
      licenseNo: licenseNo || existingDriver.licenseNo,
      tripCount: tripCount || existingDriver.tripCount,
      imageUrl,
      imagePublicId
    }

    Object.assign(existingDriver, updatedFieldsData)
    await existingDriver.save()

    // create activity log
    await ActivityLog.create({
      type: 'driver',
      performedBy: req.user._id,
      action: actionMessage,
      targetDriver: existingDriver._id
    })

    res.status(200).json({
      message: 'Driver updated successfully',
      driver: existingDriver
    })
  } catch (error) {
    next(error)
  }
}

// delete driver
const hardDeleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    console.log('DELETE DRIVER ID', id)

    // Find the driver to delete
    const driverToDelete = await Driver.findByIdAndDelete(id)
    if (!driverToDelete) {
      return next(createError(404, 'Driver not found'))
    }

    // Delete profile picture from Cloudinary if it exists
    if (driverToDelete.imagePublicId) {
      await cloudinary.uploader.destroy(driverToDelete.imagePublicId)
    }

    return res.status(200).json({
      message: 'Driver deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting driver:', error)
    next(createError(500, 'Failed to delete driver'))
  }
}

// soft delete
const softDeleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Find the driver
    const driver = await Driver.findById(id)
    if (!driver) {
      return next(createError(404, 'Driver not found'))
    }

    // Check if already deleted
    if (driver.isSoftDeleted) {
      return next(createError(400, 'Driver is already deleted'))
    }

    // Soft delete the driver
    driver.isSoftDeleted = true

    await driver.save()

    // create activity log
    await ActivityLog.create({
      type: 'driver',
      performedBy: req.user._id,
      action: 'Deleted a driver',
      targetDriver: driver._id
    })

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createDriver,
  getAllDrivers,
  updateDriver,
  hardDeleteDriver,
  softDeleteDriver
}
