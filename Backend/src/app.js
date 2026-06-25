const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust this to match your frontend URL
    credentials: true, // Allow cookies to be sent with requests
}
))
app.use(express.json())
app.use(cookieParser())

/* require all the routes here */
const authRouter = require('./routes/auth.routes')
const interviewRouter = require('./routes/interview.routes')

/* use the routes here */
app.use('/api/auth', authRouter)
app.use('/api/interview', interviewRouter)

app.get('/', (req, res) => {
    res.json({ message: "Server is running successfully!" })
})

module.exports = app