const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const {
  routeNotFoundHandler,
  globalErrorHandler
} = require('./middlewares/errorHandler')

require('dotenv').config()
require('colors')

const PORT = process.env.PORT || 5000

// connect to datebase
connectDB()

// middleware
const app = express()
app.use(
  cors({
    origin: ['https://ebun-tracking.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// routes
app.use('/api/user', require('./routes/userRoute'))
app.use('/api/driver', require('./routes/driverRoute'))
app.use('/api/truck', require('./routes/truckRoute'))
app.use('/api/tool', require('./routes/toolRoute'))
app.use('/api/deployment', require('./routes/deploymentRoute'))
app.use('/api/analytics', require('./routes/dashboardRoute'))
app.use('/api/activity-logs', require('./routes/activityLogRoute'))
app.use('/api/timeline-logs', require('./routes/timelineRoute'))

// error-handling middleware
app.use(routeNotFoundHandler)
app.use(globalErrorHandler)

console.log(new Date())

// start server
app.listen(PORT, () =>
  console.log(`Server running on port: ${PORT}`.yellow.underline)
)
