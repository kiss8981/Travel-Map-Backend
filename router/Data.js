const express = require('express');
const multer = require('multer');
const fs = require('fs');

var app = express();

var { token } = require('../config.json')

const upload = multer({dest: '../img'})

var { User } = require('../models/User');
var { UserInfo } = require('../models/UserInfo');


app.post('/', upload.single('img'), function(req, res){
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

 app.get('/', function(req,res){
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



 app.get('/image/:image_id', function(req, res){
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


 app.delete('/:image_id', function(req,res){
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


 app.get('/:user_id', function(req, res){
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


 module.exports = app;