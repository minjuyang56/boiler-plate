const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String, 
        maxlength: 50
    }, 
    email: {
        type: String, 
        trim: true, //공백을 없애주는 역할
        unique: 1
    },
    password: {
        type: String,
        maxlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String, 
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

const User = mongoose.model('User', userSchema) //schema를 model로 감싸주기

module.exports = { User } // 모델 내보내기