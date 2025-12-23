const express = require('express')
const router = express.Router()
const { getDashboardAnalytics } = require('../controllers/dashboardController')
const authenticateToken = require('../middlewares/auth')

router.get('/', authenticateToken, getDashboardAnalytics)

module.exports = router
