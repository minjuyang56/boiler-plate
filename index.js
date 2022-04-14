const express = require('express') //express 임포트  require('파일경로')는 외부 모듈을 가져오게 해줌
const app = express() //app 생성
const port = 5000
const bodyParser = require('body-parser');
const config = require('./config/key');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');
//user모델 가져오기
const { User } = require("./models/User"); 

//bodyparser가 클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게함
//application/x-www-form-urlencoded <- 이렇게 된 정보를 서버에서 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 파일로 된 정보들을 파싱
app.use(bodyParser.json());
app.use(cookieParser());    //cookieParser를 cookieParser()로 해야됨 express에서 cookieparser 활성화

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))    ////config.mongoURI가 이상해 뭘까요


//get과 post의 차이: get은 서버로부터 정보를 조회하기 위해 설계, post는 리소스를 생성/변경하기 위해 설계 (body에 정보를 담아서 전송)
app.get('/', (req, res) => 
    res.send('하이 방가방가욤')
);

//회원가입 라우트 얘는 postman에서 send해줘야 실행되고, 성공뜸 그리고 첫번째 등록할 떄만 성공, 똑같은 유저 정보를 다시 보내면 false뜨는것 같음
app.post('/api/users/register', (req, res) => {
    console.log('유저등록')
    //회원가입할 떄 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body) //리퀘스트바디에는 회원 정보들이 들어있음 (그 정보는 바디파서에서 받아줌) 상단에서 require로 가져온 User 스키마에  req.body를 담아 user라는 인스턴스로 만든다. 
    user.save((err, usersInfo) => {  //save전에 비밀번호를 암호화 시켜줘야 함
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })
}) 

//로그인 라우트 여기는 페이지 구성에 필요한 함수들에 한해서 포함되어있음
app.post('/api/users/login', function(req, res){
    console.log('진입')
    //요청된 이메일을 디비에서 존재하는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user)=> { // User는 require("./models/User"); 
        console.log('찾는중')
        if(!user) {
            console.log('이멜 없음')
            return res.json({
                loginSuccess: false, 
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

    //요청된 이메일이 디비에 있다면, 비번이 맞는지 확인한다.
    user.comparePassword(req.body.password, function(err, isMatch) {
        console.log('입력한 이메일이 디비에 존재함', 'isMatch: ', isMatch)
        if (!isMatch){
            console.log('비번틀림', user.password, req.body.password, isMatch)
            return res.json({ loginSuccess: false, massage: '비밀번호가 틀렸습니다.' })
        }
        //비번까지 맞다면, 유저를 위한 토큰을 생성
        user.generateToken(function(err, user){
            console.log('비번도 맞음')
            if(err) return res.status(400).send(err);
            
            //토큰을 쿠키에 저장
            res.cookie('x_auth', user.token)  //쿠키에 저장해주는 코드
                .status(200) //성공
                .json({ loginSuccess: true, userId: user._id })  //json으로 데이터 보내주기
            })
        })
        console.log('끝')
    }) ///여기까지가 findOne
})


//role 1 어드민
//role 0 일반유저
app.get('/api/users/auth', auth, (req, res)=>{ // auth는 auth.js에서 불러온 객체
    res.status(200).json({ //어떤 페이지에서든지 유저 정보를 이용할 수있기 때문에 훨씬 편해짐
        //여기 까지 미들웨어를 통과해 왔다는 얘기는 authentication이 true라는 말 
        _id: req.user._id,
        isAdmin: req.user.role === 0? false : true,
        isAuth: true,
        email: req.user.email,
        name : req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    //console.log('유저', user)  //user는 null값????
    //로그아웃하려는 유저의 토큰을 디비에서 찾아서 지워준다.
    User.findOneAndUpdate({_id: req.user._id}, 
        { token: '' }
        , (err, user) => {
            //console.log(user)
            if (err) return res.json({ success: false, err });
            return res.status(200).send({ success: true 
            })
        })
    })


  

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)

})

