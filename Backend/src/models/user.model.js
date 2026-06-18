const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name: {
        type: String,
        unique: [true, 'Name already exists'],
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        unique: [true, 'Email already exists'],
        required: [true, 'Email is required']  
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
})  

const userModel = mongoose.model('Users', userschema)

module.exports = userModel
