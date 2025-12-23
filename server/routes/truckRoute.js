const express = require('express')
const { upload } = require('../middlewares/multerCloudinary')
const authenticateToken = require('../middlewares/auth')
const {
  createTruck,
  getAllTrucks,
  updateTruck,
  deleteTruck,
  hardDeleteTruck,
  softDeleteTruck
} = require('../controllers/truckController')

const router = express.Router()

router
  .route('/')
  .get(authenticateToken, getAllTrucks)
  .post(upload.single('image'), authenticateToken, createTruck)

router
  .route('/:id')
  .patch(authenticateToken, upload.single('image'), updateTruck)

// delete route
router.delete('/hard-delete/:id', authenticateToken, hardDeleteTruck)
router.delete('/soft-delete/:id', authenticateToken, softDeleteTruck)

module.exports = router
