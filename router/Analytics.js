const express = require('express');
const date = new Date();

var year = date.getFullYear()
var month = new String(date.getMonth() + 1);
month = month >= 10 ? month : '0' + month; // month 두자리로 저장
var day = new String(date.getDate());
day = day >= 10 ? day : '0' + day; //day 두자리로 저장

const today3 = `${year}-${month}-${day}`

const { GraphQLClient, gql } = require('graphql-request');
const client = new GraphQLClient('https://api.cloudflare.com/client/v4/graphql')

var app = express();

var { token, cloudflareAuthKey, cloudflareAuthEmail, cloudflareZoneTag } = require('../config.json')

var { Analytics } = require('../models/Analytics');

 app.get('/', async function(req,res){
    if (!req.body.date) {
      today = today3
    } else {
      today = req.body.date
    }
    if (req.headers.token === token) {
      Analytics.find({date: today}, async function(err, analyticsData){
          if(err) return res.status(500).send({result: 'failed', info: err});
          if (analyticsData.length == 0) {
            client.setHeaders({
               "X-Auth-Key": `${cloudflareAuthKey}`,
               "X-Auth-Email": `${cloudflareAuthEmail}`
            })
            const query = gql`
            query {
               viewer {
                 zones(filter: {zoneTag: "${cloudflareZoneTag}"}) {
                   httpRequests1dGroups(limit: 100, filter: { date_gt: "${today}"}) {
                        sum {
                           requests
                           pageViews
                           bytes
                         }
                   }
                 }
               }
             }`
            const data = await client.request(query)
            if (data.viewer.zones[0].httpRequests1dGroups.length === 0) {
               Analytics.find().sort({'published_date': -1}).exec(function(err, analyticsData){
                  res.json({result: 'success', data: analyticsData});
               });
            } else {
               var analytics = new Analytics();
               analytics.bytes = data.viewer.zones[0].httpRequests1dGroups[0].sum.bytes;
               analytics.date = today;
               analytics.request = data.viewer.zones[0].httpRequests1dGroups[0].sum.requests;
               analytics.pageViews = data.viewer.zones[0].httpRequests1dGroups[0].sum.pageViews;
               analytics.save(function(err){
                  if(err){
                     console.error(err);
                     res.json({result: 'error', info: err});
                  }  
                  Analytics.find().sort({'published_date': -1}).exec(function(err, analyticsData){
                     res.json({result: 'success', data: analyticsData});
                  });
               });
            }
         } else {
            Analytics.find().sort({'published_date': -1}).exec(function(err, analyticsData){
               res.json({result: 'success', data: analyticsData});
            }
         )}
      })
    } else if (!req.headers.token) {
       return res.status(401).send({result: 'failed', info: "Authentication failed (토큰정보가 없습니다.)"});
    } else {
       return res.status(401).send({result: 'failed', info: "Authentication failed (인증에 실패하였습니다.)"});
    }
 });


 module.exports = app;