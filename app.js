const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');

var { mongoURI, port, token } = require('./config.json')
const { smtpTransport } = require('./config/email');

var { UserInfo } = require('./models/UserInfo');

var app = express();

const dataRouter = require('./router/Data');
const userRouter = require('./router/UserInfo');
const analyticsRouter = require('./router/Analytics');
const adminRouter = require('./router/Admin');

app.use(cors());
app.use(express.json());
app.use('/image', express.static('./img'))

mongoose.connect(mongoURI, {
   useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
 }).then(() => console.log('MongoDB Connected...'))
   .catch(err => console.log(err))

var generateRandom = function (min, max) {
   var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
   return ranNum;
}

app.get('/', function(req,res){
   res.json({'Hello': 'Wolrd', 'Travel': 'API'})
});

app.get('/api', function(req,res){
   res.json({'Hello': 'Wolrd', 'Travel': 'API'})
});

app.use('/api/data', dataRouter)
app.use('/api/userinfo', userRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/admin', adminRouter)


app.post('/api/email', async function(req, res){
   const number = generateRandom(111111,999999)
   const { UserEmail } = req.body;
   if (!UserEmail) return res.status(202).json({result: 'failed', info: "이메일 발송 실패 (이메일 주소를 입력해주세요)"})
   const mailOptions = {
      from: `"기록으로 남기다 👻" <admin@travel-report.xyz>`,
      to: UserEmail,
      subject: "[기록으로 남기다] 이메일 인증",
      text: "오른쪽 숫자 6자리를 입력해주세요 : " + number
   }
   await smtpTransport.sendMail(mailOptions, (error, responses) => {
      if (error) {
          return res.status(202).json({result: 'failed', info: "이메일 발송 실패"})
      } else {
          return res.status(202).json({result: 'success', info: "이메일 전송 성공 (이메일이 없을 경우 스팸메일함을 확인해 주세요)", number: number})
      }
   })
});

app.get('/api/users', function(req, res){
   if (req.headers.token === token) {
      UserInfo.find(function(err, userdata){
         return res.status(202).json({result: 'success', info: "성공적으로 데이터가 로딩되었습니다", data: userdata})
      });
   } else if (!req.headers.token) {
       return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
       return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
})



app.listen(port, function () {
  console.log(`http://127.0.0.1:${port} app listening on port ${port}`);
});