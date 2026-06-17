const {Router} = require('express')
const authController = require('../controllers/auth.controller')
const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public   
 */
authRouter.post('/register',authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', authController.loginUserController)

module.exports = authRouter