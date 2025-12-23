const express = require('express')
const {
  createDriver,
  getAllDrivers,
  updateDriver,
  deleteDriver,
  soft,
  softDeleteDriver,
  hardDeleteDriver
} = require('../controllers/driverController')
const { upload } = require('../middlewares/multerCloudinary')
const authenticateToken = require('../middlewares/auth')

const router = express.Router()

router
  .route('/')
  .get(authenticateToken, getAllDrivers)
  .post(upload.single('image'), authenticateToken, createDriver)

router
  .route('/:id')
  .patch(authenticateToken, upload.single('image'), updateDriver)

// delete route
router.delete('/hard-delete/:id', authenticateToken, hardDeleteDriver)
router.delete('/soft-delete/:id', authenticateToken, softDeleteDriver)

module.exports = router
