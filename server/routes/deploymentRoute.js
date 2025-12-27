const express = require('express')
const authenticateToken = require('../middlewares/auth')
const {
  createDeployment,
  getAllDeployments,
  updateDeployment,
  softDeleteDeployment
} = require('../controllers/deploymentController')

const router = express.Router()

router
  .route('/')
  .post(authenticateToken, createDeployment)
  .get(authenticateToken, getAllDeployments)

router.route('/:id').patch(authenticateToken, updateDeployment)

router.route('/soft-delete/:id').delete(authenticateToken, softDeleteDeployment)

module.exports = router
