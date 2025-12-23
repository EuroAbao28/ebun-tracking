const express = require('express')
const authenticateToken = require('../middlewares/auth')
const { getAllTimelineLogs } = require('../controllers/timelineLogController')

const router = express.Router()

router.route('/').get(authenticateToken, getAllTimelineLogs)

module.exports = router
