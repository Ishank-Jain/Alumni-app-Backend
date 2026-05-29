const express = require('express')
const errorHandler = require('./middlewares/errorHandler')
const cors = require('cors');
const app = express()


//allowing the two frontend origins to poll our backend.
// const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:30080'];

// app.use(cors({
//   origin: true,
//   credentials: true
// }));

// remove the cors middleware block and let Istio handle it
app.use(cors())

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


