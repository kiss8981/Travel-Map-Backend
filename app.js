var express = require('express');
var request = require('request');
var { NaverClientId, NaverClientSecret, port } = require('./config.json')
var cors = require('cors');
var app = express();

app.use(cors());

app.get('/coronanews', function(req, res){
  var api_url = 'https://openapi.naver.com/v1/search/news.json?query=%EC%BD%94%EB%A1%9C%EB%82%98&sort=sim'; // json 결과
  var options = {
      url: api_url,
      headers: {'X-Naver-Client-Id': NaverClientId, 'X-Naver-Client-Secret': NaverClientSecret}
   };
  request.get(options, function (error, response, body) {
      res.json(JSON.parse(body))
   });
});

app.listen(port, function () {
  console.log(`http://127.0.0.1:${port} app listening on port ${port}`);
});