const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');
const multer = require('multer')
const jwt = require('jsonwebtoken')
const fs = require('fs')

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
               return res.status(401).send({result: 'error', info: err});
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


app.post('/api/userinfo/:user_id', function(req, res){
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
               res.json({result: 'Success (성공적으로 데이터를 추가했습니다)', 'user_token': token, 'user_id': id})
            });
         } else {
            if(err) return res.status(500).json({error: err});
            res.status(202).json({result: 'Success', 'user_token': userdata[0].user_token, 'user_id': userdata[0].id})
         }
      })
   } else if (!req.headers.token) {
      return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
   } else {
      return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
   }
});

app.listen(port, function () {
  console.log(`http://127.0.0.1:${port} app listening on port ${port}`);
});