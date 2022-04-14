const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 15;
const jwt = require('jsonwebtoken'); 

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
        maxlength: 1000
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

//save함수가 실행되기 전에 비번을 암호화시키기
userSchema.pre('save', function( next ){ //save함수를 실행하기 전에 
    var user = this; //user객체 정해줌

    if(user.isModified('password')){    //비번이 바꼈을 때만 암호화 해줌(아이디, 이메일은 바껴도 암호화 x)
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    }else{
        next()
    }
    
})

//사용자가 입력한 비번과 암호화된 비번을 비교? 여기서 this는 
userSchema.methods.comparePassword = function (plainPassword, cb) {
    const app = this
    //plainPassword 1234 암호화된 비밀번호 $2b$10$6FAmjXfUn9pDWIg0YVoVuek1qiSWKkoSgKBqxILONqvlfgPa4hxL2
    bcrypt.compare(plainPassword, app.password, function (err, isMatch){
        console.log('이 비번', app.password); //this.password가 undefined
        if (err) return cb(err);
        cb(null, isMatch);
    })
}//0000 $2b$10$ML0qv.ByPlXea99AbmMH/ul8EbMk/5uRL33ecfTKljPLXN3Ha8hzS undefined

//로그인 성공한 유저를 위한 토큰 생성 코드 
userSchema.methods.generateToken = function(cb){  //this는 데이터 인스턴스를 가리킴
    
    var user = this;

    // jsonwebtoken을 이용하여 token생성하기 
    // token =  userinfo + secrettoken
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })//이게 무슨 코드인지 이해가 안가요...
}

userSchema.statics.findByToken = function(token, cb){ //this는 모델 자체를 가리킴
    var user = this;
    
    //토큰을 decode한다.
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저 찾기
        //클라이언트에서 가져온 토큰과 디비에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, 'token': token }, function (err, user){
            if(err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema) //schema를 model로 감싸주기

module.exports = { User } // 모델 내보내기