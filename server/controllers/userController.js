const createError = require('http-errors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  validateFields,
  validateRole,
  validateStatus
} = require('../utils/validationFields')
const { isValidFileType } = require('../utils/validationFile')
const sharp = require('sharp')
const { uploadImageToCloudinary } = require('../utils/cloudinaryUtils')
const User = require('../models/userModel')
const { cloudinary } = require('../middlewares/multerCloudinary')
const sendStatusEmail = require('../utils/emailService')
const ActivityLog = require('../models/activityLogsModel')

// create user
const createUser = async (req, res, next) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      email,
      phoneNo,
      password,
      confirmPassword,
      role,
      status
    } = req.body

    console.log(req.body)

    // validate fields
    validateFields({
      firstname,
      lastname,
      email,
      phoneNo,
      password,
      confirmPassword
    })

    if (status == 'admin') return next(createError(400, 'Access denied'))

    // validate if password match
    if (password !== confirmPassword) {
      return next(createError(400, 'Password do not match'))
    }

    // valdate password strength
    if (password.length < 8) {
      return next(createError(400, 'Password must be at least  8 characters'))
    }

    // check if email already exist
    const isUserAlreadyExist = await User.findOne({ email })
    if (isUserAlreadyExist) {
      return next(createError(409, 'Email already exist'))
    }

    // validate role
    validateRole(role)

    // validate status
    validateStatus(status)

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

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

        // folder path
        const folderPath =
          role === 'head_admin' || role === 'admin'
            ? 'Ebun/admin'
            : 'Ebun/visitor'

        // upload the image to cloudinary
        const uploadResult = await uploadImageToCloudinary(
          compressedImage,
          folderPath
        )

        imageData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      } catch (error) {
        return next(error)
      }
    }

    // create new user
    const newUser = await User.create({
      firstname,
      middlename,
      lastname,
      email,
      phoneNo,
      password: hashedPassword,
      role,
      status,
      imageUrl: imageData.url,
      imagePublicId: imageData.publicId
    })

    // convert to object and remove password
    const userWithoutPassword = newUser.toObject()
    delete userWithoutPassword.password

    // create activity log
    await ActivityLog.create({
      type: 'visitor',
      performedBy: newUser._id,
      action: 'Account registration request submitted',
      targetUser: newUser._id
    })

    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    next(error)
  }
}

// create admin
const createAdmin = async (req, res, next) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      email,
      phoneNo,
      password,
      confirmPassword,
      role,
      status
    } = req.body

    console.log(req.body)

    if (!['head_admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // validate fields
    validateFields({
      firstname,
      lastname,
      email,
      phoneNo,
      password,
      confirmPassword
    })

    // validate if password match
    if (password !== confirmPassword) {
      return next(createError(400, 'Password do not match'))
    }

    // valdate password strength
    if (password.length < 8) {
      return next(createError(400, 'Password must be at least  8 characters'))
    }

    // check if email already exist
    const isUserAlreadyExist = await User.findOne({ email })
    if (isUserAlreadyExist) {
      return next(createError(409, 'Email already exist'))
    }

    // validate role
    validateRole(role)

    // validate status
    validateStatus(status)

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

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
          'Ebun/admin'
        )

        imageData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        }
      } catch (error) {
        return next(error)
      }
    }

    // create new user
    const newUser = await User.create({
      firstname,
      middlename,
      lastname,
      email,
      phoneNo,
      password: hashedPassword,
      role,
      status,
      imageUrl: imageData.url,
      imagePublicId: imageData.publicId
    })

    // convert to object and remove password
    const userWithoutPassword = newUser.toObject()
    delete userWithoutPassword.password

    // create activity log
    await ActivityLog.create({
      type: 'admin',
      performedBy: req.user._id,
      action: 'Created an admin account',
      targetUser: newUser._id
    })

    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    next(error)
  }
}

// login user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // validate required fields
    validateFields({ email, password })

    // check if user exist
    const user = await User.findOne({ email })
    if (!user) {
      return next(createError(401, 'Invalid email or password'))
    }

    // compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return next(createError(401, 'Invalid email or password'))
    }

    const statusMessages = {
      inactive: 'This account is deactivated',
      pending: 'This account approval is still pending',
      rejected: 'This account request has been rejected',
      revoked: 'This account access has been revoked'
    }

    if (statusMessages[user.status]) {
      return next(createError(401, statusMessages[user.status]))
    }

    // Only allow 'active' status to login
    if (user.status !== 'active') {
      return next(createError(401, 'This account is not authorized to login'))
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { loginCount: 1 },
        lastLogin: new Date()
      },
      { new: true }
    ).select('-password')

    const token = jwt.sign(
      { id: updatedUser._id, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // create activity log
    await ActivityLog.create({
      type: user.role === 'visitor' ? 'visitor' : 'admin',
      performedBy: user._id,
      action: 'Logged in to the system',
      targetUser: user._id
    })

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: updatedUser._id,
        firstname: updatedUser.firstname,
        middlename: updatedUser.middlename,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        phone: updatedUser.phoneNo,
        role: updatedUser.role,
        status: updatedUser.status,
        loginCount: updatedUser.loginCount,
        lastLogin: updatedUser.lastLogin,
        imageUrl: updatedUser.imageUrl,
        imagePublicId: updatedUser.imagePublicId
      }
    })
  } catch (error) {
    next(error)
  }
}

// logout user
const logoutUser = async (req, res, next) => {
  try {
    // create activity log
    await ActivityLog.create({
      type: req.user.role === 'visitor' ? 'visitor' : 'admin',
      performedBy: req.user._id,
      action: 'Logged out to the system',
      targetUser: req.user._id
    })

    res.status(200).json({
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

// get current user
const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      message: 'Admin fetched successfully',
      user: req.user
    })
  } catch (error) {
    next(createError(500, 'Failed to fetch user. Please try again'))
  }
}

// get all user
const getAllUsers = async (req, res, next) => {
  try {
    const {
      status,
      role,
      sort,
      search,
      perPage,
      page = 1,
      showDeleted
    } = req.query

    const query = {}

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    if (showDeleted !== 'true') {
      query.$or = [
        { isSoftDeleted: false },
        { isSoftDeleted: { $exists: false } }
      ]
    }

    console.log(req.query)

    // filters
    if (status) query.status = status
    if (role) query.role = role

    // search
    if (search) {
      const regex = { $regex: search, $options: 'i' }
      query.$or = [
        { firstname: regex },
        { middlename: regex },
        { lastname: regex },
        { email: regex },
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
      'z-a': { firstname: -1 }
    }

    const sortQuery = sortOptions[sort] || sortOptions.latest

    // query database
    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort(sortQuery)
    ])

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      users
    })
  } catch (error) {
    next(error)
  }
}

// udpate user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { firstname, middlename, lastname, email, phoneNo, role, status } =
      req.body

    console.log('Update request body:', req.body)

    // find the user
    const existingUser = await User.findById(id)
    if (!existingUser) {
      return next(createError(404, 'User not found'))
    }

    if (req.user.role === 'visitor' && id === req.user._id) {
    }

    // Check permissions
    if (
      req.user.role !== 'head_admin' &&
      req.user.role !== 'admin' &&
      req.user.role !== 'visitor'
    ) {
      return next(createError(403, 'Access denied'))
    }

    if (req.user.role === 'admin' && existingUser.role === 'admin') {
      return next(createError(403, 'Access denied'))
    }

    // Track if status is being changed
    const isStatusChanged = status && status !== existingUser.status

    // handle file upload if provided
    let imageUrl = existingUser.imageUrl
    let imagePublicId = existingUser.imagePublicId

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
          existingUser.role === 'head_admin' || existingUser.role === 'admin'
            ? 'Ebun/admin'
            : 'Ebun/visitor'
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
    if (firstname && firstname !== existingUser.firstname)
      updatedFields.push('firstname')
    if (lastname && lastname !== existingUser.lastname)
      updatedFields.push('lastname')
    if (email && email !== existingUser.email) updatedFields.push('email')
    if (phoneNo && phoneNo !== existingUser.phoneNo)
      updatedFields.push('phone number')
    if (status && status !== existingUser.status) updatedFields.push('status')
    if (role && role !== existingUser.role) updatedFields.push('role')
    if (req.file) updatedFields.push('profile picture')

    // Check if user is updating their own profile
    const isUpdatingOwnProfile = req.user._id.toString() === id.toString()
    let actionMessage = ''
    if (updatedFields.length > 0) {
      if (isUpdatingOwnProfile) {
        // User is updating their own profile
        const roleString =
          existingUser.role === 'head_admin'
            ? 'Head admin'
            : existingUser.role === 'admin'
            ? 'Admin'
            : 'Visitor'

        actionMessage = `${roleString} updated their own ${updatedFields.join(
          ', '
        )}`
      } else {
        // User is updating another user's profile
        const targetRole =
          existingUser.role === 'head_admin'
            ? "Head admin's"
            : existingUser.role === 'admin'
            ? "Admin's"
            : "Visitor's"

        actionMessage = `Updated ${targetRole} ${updatedFields.join(', ')}`
      }
    } else {
      // No fields were actually changed
      if (isUpdatingOwnProfile) {
        const roleString =
          existingUser.role === 'head_admin'
            ? 'Head admin'
            : existingUser.role === 'admin'
            ? 'Admin'
            : 'Visitor'

        actionMessage = `${roleString} attempted to update their own profile (no changes)`
      } else {
        const targetRole =
          existingUser.role === 'head_admin'
            ? 'Head admin'
            : existingUser.role === 'admin'
            ? 'Admin'
            : 'Visitor'

        actionMessage = `Attempted to update ${targetRole} profile (no changes)`
      }
    }
    // update fields
    const updatedFieldsData = {
      firstname: firstname || existingUser.firstname,
      middlename: middlename || existingUser.middlename,
      lastname: lastname || existingUser.lastname,
      email: email || existingUser.email,
      phoneNo: phoneNo || existingUser.phoneNo,
      role: role || existingUser.role,
      status: status || existingUser.status,
      imageUrl,
      imagePublicId
    }

    Object.assign(existingUser, updatedFieldsData)
    await existingUser.save()

    // Send email notification if status was changed
    if (isStatusChanged) {
      try {
        sendStatusEmail({
          user: {
            firstname: existingUser.firstname,
            email: existingUser.email
          },
          status: existingUser.status
        })
          .then(() => {
            console.log(
              `Status email sent to ${existingUser.email} for new status: ${existingUser.status}`
            )
          })
          .catch(error => {
            console.error('Failed to send status email:', error)
          })
      } catch (emailError) {
        console.error('Error sending status email:', emailError)
      }
    }

    // create activity log
    await ActivityLog.create({
      type: 'admin',
      performedBy: req.user._id,
      action: actionMessage,
      targetUser: existingUser._id
    })

    res.status(200).json({
      message: 'User updated successfully',
      user: existingUser,
      statusChanged: isStatusChanged,
      newStatus: existingUser.status
    })
  } catch (error) {
    next(error)
  }
}

// hard delete user
const hardDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    console.log('DELETE USER ID', id)

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    // Find the user to delete
    const userToDelete = await User.findByIdAndDelete(id)
    if (!userToDelete) {
      return next(createError(404, 'User not found'))
    }

    // Delete profile picture from Cloudinary if it exists
    if (userToDelete.imagePublicId) {
      await cloudinary.uploader.destroy(userToDelete.imagePublicId)
    }

    return res.status(200).json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    next(createError(500, 'Failed to delete user'))
  }
}

// soft delete user
const softDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!['head_admin', 'admin'].includes(req.user.role)) {
      return next(createError(403, 'Access denied'))
    }

    const user = await User.findById(id)
    if (!user) {
      return next(createError(404, 'User not found'))
    }

    // Check if already deleted
    if (user.isSoftDeleted) {
      return next(createError(400, 'User is already deleted'))
    }

    // Soft delete the user
    user.isSoftDeleted = true

    await user.save()

    // create activity log
    await ActivityLog.create({
      type: 'admin',
      performedBy: req.user._id,
      action:
        user.role === 'admin'
          ? 'Deleted an admin account'
          : 'Deleted a visitor account',
      targetUser: user._id
    })

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    next()
  }
}

module.exports = {
  createUser,
  createAdmin,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  hardDeleteUser,
  softDeleteUser
}
