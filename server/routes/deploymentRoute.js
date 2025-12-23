const express = require('express')
const authenticateToken = require('../middlewares/auth')
const {
  createDeployment,
  getAllDeployments,
  updateDeployment
} = require('../controllers/deploymentController')

const router = express.Router()

router
  .route('/')
  .post(authenticateToken, createDeployment)
  .get(authenticateToken, getAllDeployments)

router.route('/:id').patch(authenticateToken, updateDeployment)

module.exports = router
