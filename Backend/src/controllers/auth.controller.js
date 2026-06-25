const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blacklist.model')

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}

/**
 * @desc Register a new user, expects name, email and password in the request body
 * @route POST /api/auth/register
 * @access Public
 */

async function registerUserController(req, res) {
    const {name, username, email, password} = req.body
    const userName = name || username

    if (!userName || !email || !password) {
        return res.status(400).json({
            message: 'Please provide name, email and password'
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{name: userName}, {email}]
    })

    if (isUserAlreadyExists) {

        /* isUserAlreadyExists will be null if no user is found, otherwise it will be an object containing the user data. So we can use this to check if the user already exists. */
        return res.status(400).json({
            message: 'User already exists'
        })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        name: userName,
        email,
        password: hash
    })

    const token = jwt.sign({
        id: user._id,
        name: user.name},
        process.env.JWT_SECRET,
        {expiresIn: '1d'},
    )

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })
}

/**
 * @name loginUserController
 * @desc Login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {  
    const {email, password} = req.body
    const user = await userModel.findOne({email})
    if (!user) {
        return res.status(400).json({
            message: 'Invalid email or password'
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return res.status(400).json({
            message: 'Invalid email or password'
        })
    }
    const token = jwt.sign({
        id: user._id,
        name: user.name},
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
    )
    res.cookie('token', token, cookieOptions)
    res.status(200).json({
        message: 'User logged in successfully',
        user: { 
            id: user._id,
            name: user.name,
            email: user.email
        }
    })
}

/**
 * @name logoutUserController
 * @desc Logout a user, expects token in the request cookies
 * @access Public   
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token
    if (token) {
        await tokenBlacklistModel.create({ token })
    }
    res.clearCookie('token', cookieOptions)
    res.status(200).json({
        message: 'User logged out successfully'
    })
}

/**
 * @name getMeController
 * @desc Get the logged in user details
 * @access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message: 'User details fetched successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}