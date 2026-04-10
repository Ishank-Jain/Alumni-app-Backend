const express = require('express')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(express.json())                    // parse JSON bodies
app.use(express.urlencoded({ extended: true }))


// Health Check 
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Alumni API is running 🚀' })
})

// API Routes (v1) 
app.use('/api/v1', require('./routes/v1'));

app.use(errorHandler);

module.exports = app


