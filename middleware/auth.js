const { User } = require("../models/User");

let auth = (req, res, next) => {
    
    //인증처리하는 곳

    //클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;

    //토큰을 복호화하고 유저를 찾는 함수를 실행함 (이 함수는 user에서 정의됨)
    User.findByToken(token, (err, user) => {  //유저찾기
        console.log('유저', user)
        if(err) throw err; 
        if(!user) return res.json({ isAuth: false, error: true }) //유저 없으면 fail
        //유저 있어!
        req.token = token;  
        req.user = user;
        next();
    }) 

}


module.exports = { auth };
