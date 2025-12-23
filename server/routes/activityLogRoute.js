const express = require('express')
const authenticateToken = require('../middlewares/auth')
const { getAllActivityLogs } = require('../controllers/activityLogController')

const router = express.Router()

router.route('/').get(authenticateToken, getAllActivityLogs)

module.exports = router
