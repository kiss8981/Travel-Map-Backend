const mongoose = require('mongoose')
const express = require('express');
const cors = require('cors');

var { mongoURI, port, token } = require('./config.json')

var { User } = require('./models/User');

var app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(mongoURI, {
   useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
 }).then(() => console.log('MongoDB Connected...'))
   .catch(err => console.log(err))

app.post('/api/data', function(req, res){
   if (req.headers.token === token) {
      var userDB = new User();
      userDB.user_id = req.body.user_id;
      userDB.place_name = req.body.place_name;
      userDB.description = req.body.description;
      userDB.latlng = req.body.latlng;
      userDB.img = req.body.img;
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

app.listen(port, function () {
  console.log(`http://127.0.0.1:${port} app listening on port ${port}`);
});