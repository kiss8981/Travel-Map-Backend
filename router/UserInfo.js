const mongoose = require('mongoose')
const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

var { token } = require('../config.json')

var { UserInfo } = require('../models/UserInfo');

var app = express();

app.get('/:user_id', function(req, res){
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

 app.post('/:user_id', function(req, res){
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
                   userId: req.params.user_id,
                   userName: req.body.user_name,
                   userEmail: req.body.user_email
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

 app.post('/register/:user_id', function(req, res){
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

 app.post('/login/:user_id', function(req, res){
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

 module.exports = app;
 