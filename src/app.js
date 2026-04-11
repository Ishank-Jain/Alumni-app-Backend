const express = require('express')
const errorHandler = require('./middlewares/errorHandler')
const cors = require('cors');
const app = express()


//allowing the two frontend origins to poll our backend.
const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));


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


