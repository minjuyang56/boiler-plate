const express = require('express') //express 임포트  require('파일경로')는 외부 모듈을 가져오게 해줌
const app = express() //app 생성
const port = 5000
const bodyParser = require('body-parser');
const config = require('./config/key');
//user모델 가져오기
const { User } = require("./models/User"); 

//bodyparser가 클라이언트에서 오는 정보를 서버에서 분석해서 가져올 수 있게함
//application/x-www-form-urlencoded <- 이렇게 된 정보를 서버에서 분석해서 가져올 수 있게 해줌
app.use(bodyParser.urlencoded({ extended: true }));

//application/json 파일로 된 정보들을 파싱
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected..'))
.catch(err => console.log(err))    ////config.mongoURI가 이상해 뭘까요


//get과 post의 차이: get은 서버로부터 정보를 조회하기 위해 설계, post는 리소스를 생성/변경하기 위해 설계 (body에 정보를 담아서 전송)
app.get('/', (req, res) => 
    res.send('하이 방가방가욤')
);

//회원가입 라우트 얘는 postman에서 send해줘야 실행되고, 성공뜸 그리고 첫번째 등록할 떄만 성공, 똑같은 유저 정보를 다시 보내면 false뜨는것 같음
app.post('/register', (req, res) => {
    console.log('안뇽')
    //회원가입할 떄 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body) //리퀘스트바디에는 회원 정보들이 들어있음 (그 정보는 바디파서에서 받아줌) 상단에서 require로 가져온 User 스키마에  req.body를 담아 user라는 인스턴스로 만든다. 
    user.save((err, usersInfo) => { 
        if(err) return res.json({ success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log('7')
})

