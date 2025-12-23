const jwt = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../models/userModel')

const authenticateToken = async (req, res, next) => {
  try {
    // get token from authorization header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return next(createError(401, 'Access denied'))

    // verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) throw createError(404, 'User not found')

    if (user.status === 'inactive') {
      throw createError(401, 'This account is deactivated')
    }

    if (user.status === 'pending') {
      throw createError(401, 'Account pending approval')
    }

    if (user.status === 'rejected') {
      throw createError(401, 'Account access rejected')
    }

    if (user.status === 'revoked') {
      throw createError(401, 'Account access revoked')
    }

    req.user = user
    next()
  } catch (error) {
    console.log(error)

    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid session. Please log in again.'))
    }

    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Session expired. Please log in again.'))
    }

    next(error)
  }
}

module.exports = authenticateToken
