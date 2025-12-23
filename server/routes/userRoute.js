const express = require('express')
const { upload } = require('../middlewares/multerCloudinary')
const authenticateToken = require('../middlewares/auth')
const {
  loginUser,
  logoutUser,
  createUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  createAdmin,
  hardDeleteUser,
  softDeleteUser
} = require('../controllers/userController')

const router = express.Router()

router.post('/login', loginUser)
router.post('/logout', authenticateToken, logoutUser)

router
  .route('/')
  .get(authenticateToken, getAllUsers)
  .post(upload.single('image'), createUser)

router.post(
  '/create-admin',
  authenticateToken,
  upload.single('image'),
  createAdmin
)

router
  .route('/:id')
  .patch(authenticateToken, upload.single('image'), updateUser)

router.get('/current-user', authenticateToken, getCurrentUser)

// delete route
router.delete('/hard-delete/:id', authenticateToken, hardDeleteUser)
router.delete('/soft-delete/:id', authenticateToken, softDeleteUser)

module.exports = router
