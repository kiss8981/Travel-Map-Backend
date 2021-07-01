const express = require('express');
const date = new Date();

var app = express();

var { UserInfo } = require('../models/UserInfo');
var { Admin } = require('../models/Admin');
var { token } = require('../config.json')

var year = date.getFullYear()
var month = new String(date.getMonth() + 1);
month = month >= 10 ? month : '0' + month; // month 두자리로 저장
var day = new String(date.getDate());
day = day >= 10 ? day : '0' + day; //day 두자리로 저장

const today = `${year}-${month}-${day}`

app.get('/', function(req, res){
   if (!req.headers.user_token) {
      return res.status(202).json({result: 'failed', info: "토큰 정보가 없습니다!", data: []})
   } else {
      UserInfo.find({user_token: req.headers.user_token}, function(err, userdata){
         if (!userdata) return res.status(202).json({result: 'failed', info: "정보를 찾을수 없습니다!", data: []})
         if (userdata.length === 0) return res.status(202).json({result: 'failed', info: "정보를 찾을수 없습니다!", data: []})
         if (userdata[0].is_admin === true) {
            return res.status(202).json({result: 'success', info: "관리자 인증 성공!", data: userdata[0]})
         }
         if (!userdata[0].admin || userdata[0].admin === "" || userdata[0].admin === null || userdata[0].admin === undefined) {
            return res.status(202).json({result: 'failed', info: "관리자만 접근이 가능합니다!", data: userdata[0]})
         };
      })
   }
});

app.get('/alart', function(req, res){
   if (!req.headers.token === token) {
      return res.status(202).json({result: 'failed', info: "토큰 정보가 없습니다!", data: []})
   }
   if (req.headers.token === token) {
      Admin.find().sort({'published_date': -1}).exec(function(err, admindata){
         if (!admindata) return res.status(202).json({result: 'failed', info: "정보를 찾을수 없습니다!", data: []})
         if (admindata.length === 0) return res.status(202).json({result: 'success', info: "알림이 없습니다!", data: []})
         return res.status(202).json({result: 'success', info: "알림목록을 불러왔습니다!", data: admindata})
      })
   } else {
      return res.status(202).json({result: 'failed', info: "토큰정보가 올바르지 않습니다!", data: []})
   }
});

app.post('/alart', function(req, res){
   if (!req.headers.token === token) {
      return res.status(202).json({result: 'failed', info: "토큰 정보가 없습니다!", data: []})
   }
   if (req.headers.token === token) {
      var adminAlart = new Admin();
      adminAlart.date = today;
      adminAlart.msg = req.body.message;
      adminAlart.author = req.body.author;
      adminAlart.title = req.body.title;
      adminAlart.save(function(err){
         if(err){
            console.error(err);
            res.json({result: 'error', info: err});
         }  
         Admin.find().sort({'published_date': -1}).exec(function(err, admindata){
            return res.status(202).json({result: 'success', info: "알림을 추가했습니다!", data: admindata})
         });
      });
   } else {
      return res.status(202).json({result: 'failed', info: "토큰정보가 올바르지 않습니다!", data: []})
   }
});

module.exports = app;