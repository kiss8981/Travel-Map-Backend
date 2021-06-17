const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const multer = require('multer')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bcrypt = require('bcrypt')

const upload = multer({dest: './img'})

var { mongoURI, port, token } = require('./config.json')

var { User } = require('./models/User');
var { UserInfo } = require('./models/UserInfo');

var app = express();

app.use(cors());
app.use(express.json());
app.use('/image', express.static('./img'))

mongoose.connect(mongoURI, {
   useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
 }).then(() => console.log('MongoDB Connected...'))
   .catch(err => console.log(err))

app.get('/', function(req,res){
   res.json({'Hello': 'Wolrd', 'Travel': 'API'})
});

app.get('/api', function(req,res){
   res.json({'Hello': 'Wolrd', 'Travel': 'API'})
});

app.post('/api/data', upload.single('img'), function(req, res){
   if (req.headers.token === token) {
      var userDB = new User();
      userDB.user_id = req.body.user_id;
      userDB.user_name = req.body.user_name;
      userDB.user_email = req.body.user_email;
      userDB.user_token = req.body.user_token;
      userDB.place_name = req.body.place_name;
      userDB.description = req.body.description;
      userDB.latlng = req.body.latlng;
      userDB.img = '/image/' + req.file.filename;
      userDB.visittime = req.body.visittime;
      userDB.save(function(err){
         if(err){
            console.error(err);
            res.json({result: 'error', info: err});
         return;
      }
      res.json({result: 'success'});
      });
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
      return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});


app.get('/api/data', function(req,res){
   if (req.headers.token === token) {
      User.find(function(err, userdata){
         if(err) return res.status(500).send({result: 'failed', info: err});
         res.json(userdata);
     })
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
      return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});

app.get('/api/data/image/:image_id', function(req, res){
   if (req.headers.token === token) {
      User.find({img: '/image/' + req.params.image_id}, function(err, userdata){
         if(err) return res.status(500).json({error: err});
         if(!userdata) return res.status(404).json({error: 'userdata not found'});
         res.json(userdata);
      })
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
         return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});

app.delete('/api/data/:image_id', function(req,res){
   if (req.headers.token === token) {
      User.find({img: '/image/' + req.params.image_id}, function(err, userdata){
         UserInfo.find({id: req.headers.user_id}, function(err, userinfodata){
            if (userdata.length === 0) {
               return res.status(401).send({result: 'failed', info: "Authentication failed (일치하는 유저정보가 없습니다.)"});
            } else if (req.headers.user_token === userinfodata[0].user_token) {
               User.remove({ img: '/image/' + req.params.image_id }, function(err, output){
                  if(err) return res.status(500).json({result: 'failed', info: "Database failure (데이터베이스 오류 발생.)"});
                  res.json({result: 'success', info: "Delete success (성공적으로 삭제했습니다.)"});
                  fs.unlink('img/' + req.params.image_id, function(err){
                     if(err) console.log(err);
                     console.log(`${req.params.image_id} file deleted`);
                  })
              })
            } else if (!req.headers.user_token) {
               return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
            } else {
               return res.status(401).send({result: 'failed', info: err});
            }
         })
      })
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
      return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});

app.get('/api/data/:user_id', function(req, res){
   if (req.headers.token === token) {
      User.find({user_id: req.params.user_id}, function(err, userdata){
         if(err) return res.status(500).json({error: err});
         if(!userdata) return res.status(404).json({error: 'userdata not found'});
         res.json(userdata);
      })
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
      return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});

app.get('/api/userinfo/:user_id', function(req, res){
   if (req.headers.token === token) {
      UserInfo.find({id: req.params.user_id}, function(err, userdata){
         if(err) return res.status(500).json({error: err});
         if(!userdata) return res.status(404).json({error: 'userdata not found'});
         res.json({'id': userdata[0].id, 'user_name': userdata[0].user_name, 'user_email': userdata[0].user_email});
      })
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
      return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});


app.post('/api/userinfo/:user_id', function(req, res){
   if (!req.body.user_id || req.body.user_id === null || req.body.user_id === "") {
      return res.status(401).send({result: 'failed', info: "Authentication failed (유저 아이디 정보가 없습니다.)"});
   } else{
      if (req.headers.token === token) {
         UserInfo.find({user_id: req.params.user_id}, function(err, userdata){
            if (userdata.length === 0 || !userdata || userdata === null) {
               function generateRandomCode(n) {
                  let str = ''
                  for (let i = 0; i < n; i++) {
                  str += Math.floor(Math.random() * 10)
                  }
                  return str
               }

               var id = generateRandomCode(10)
               var token = jwt.sign({
                  userid: req.params.user_id
               },
               "travelReportToken",
               {
                  subject: "travelReport",
                  issuer: "travelReportToken"
               });
               var userInfoDB = new UserInfo();
               userInfoDB.type = req.body.type;
               userInfoDB.id = id;
               userInfoDB.user_token = token;
               userInfoDB.user_id = req.body.user_id;
               userInfoDB.user_name = req.body.user_name;
               userInfoDB.user_email = req.body.user_email;
               userInfoDB.save(function(err){
                  if(err){
                     console.error(err);
                     res.json({result: 'Error', info: err});
                  return;
               }
                  res.json({result: 'success', 'user_token': token, 'user_id': id})
               });
            } else {
               if(err) return res.status(500).json({error: err});
               res.status(202).json({result: 'success', 'user_token': userdata[0].user_token, 'user_id': userdata[0].id})
            }
         })
      } else if (!req.headers.token) {
         return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
      } else {
         return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
      }
   }
});



app.post('/api/userinfo/register/:user_id', function(req, res){
   if (!req.body.user_id || req.body.user_id === null || req.body.user_id === "") {
      return res.status(401).send({result: 'failed', info: "유저 아이디 정보가 없습니다."});
   } else{
      if (req.headers.token === token) {
         UserInfo.find({user_id: req.params.user_id}, function(err, userdata){
            if (userdata.length === 0 || !userdata || userdata === null) {
               function generateRandomCode(n) {
                  let str = ''
                  for (let i = 0; i < n; i++) {
                  str += Math.floor(Math.random() * 10)
                  }
                  return str
               }

               var id = generateRandomCode(10)
               var token = jwt.sign({
                  userid: req.params.user_id
               },
               "travelReportToken",
               {
                  subject: "travelReport",
                  issuer: "travelReportToken"
               });
               const encryptedPassowrd = bcrypt.hashSync(req.body.user_password, 10)
               var userInfoDB = new UserInfo();
               userInfoDB.type = req.body.type;
               userInfoDB.id = id;
               userInfoDB.user_token = token;
               userInfoDB.user_id = req.body.user_id;
               userInfoDB.user_name = req.body.user_name;
               userInfoDB.user_email = req.body.user_email;
               userInfoDB.user_password = encryptedPassowrd;
               userInfoDB.save(function(err){
                  if(err){
                     console.error(err);
                     res.json({result: 'failed', info: err});
                  return;
               }
                  res.json({result: 'success', 'user_token': token, 'user_id': id, 'user_name': req.body.user_name, 'user_email': req.body.user_email})
               });
            } else {
               if(err) return res.status(500).json({error: err});
               res.status(202).json({'result': 'failed', 'info': "이미 가입된 유저입니다"})
            }
         })
      } else if (!req.headers.token) {
         return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
      } else {
         return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
      }
   }
});

app.post('/api/userinfo/login/:user_id', function(req, res){
   if (!req.body.user_password || req.body.user_password === null || req.body.user_password === undefined) {
      return res.status(401).json({result: 'failed', info: "Authentication failed (유저비빌번호 정보가 없습니다.)"})
   };
   if (!req.body.user_id || req.body.user_id === null || req.body.user_id === "") {
      return res.status(401).json({result: 'failed', info: "Authentication failed (유저 아이디 정보가 없습니다.)"});
   } else{
      if (req.headers.token === token) {
         UserInfo.find({user_id: req.params.user_id}, function(err, userdata){
            if (userdata.length === 0 || !userdata || userdata === null) {
               return res.status(202).json({'result': "failed", 'info': "미가입 유저입니다"})
            } else if (userdata.length === 1) {
               if(err) return res.status(500).json({error: err});
               data = userdata[0]
               const same = bcrypt.compareSync(req.body.user_password, data.user_password)
               if (same) {
                  return res.json({result: 'success', 'user_token': data.user_token, 'user_id': data.id, 'user_name': data.user_name , 'user_email': data.user_email})
               } else {
                  return res.status(200).json({result: 'failed', info: "비밀번호가 올바르지 않습니다"});
               }
            } else {
               if(err) return res.status(500).json({error: err});
               return res.status(200).json({result: 'failed', info: "Authentication failed (오류발생)"});
            }
         })
      } else if (!req.headers.token) {
         return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
      } else {
         return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
      }
   }
});

app.listen(port, function () {
  console.log(`http://127.0.0.1:${port} app listening on port ${port}`);
});