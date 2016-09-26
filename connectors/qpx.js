var config = require('../config/config'),
    https = require('https');

var apiKey = config.qpxKey;
 
var body = {
    "request": {
    "passengers": { "adultCount": 1 },
    "slice": [{
        "origin": null,
        "destination": null,
        "date": null // YYYY-MM-DD 
      }/*,
      {
        "origin": destination,
        "destination": origin,
        "date": returningDate // YYYY-MM-DD 
      }*/
    ]
  }
};
var options = {
    hostname: "googleapis.com",
    path: "/qpxExpress/v1/trips/search?key="+apiKey,
    method: 'POST', //POST,PUT,DELETE etc
    port: 443,
    headers: {
        'Content-Type': 'application/json'
    }
};

module.exports = {
  
  search: function(from,to,date,callback){
    
    body.request.slice[0].origin = from;
    body.request.slice[0].destination = to;
    body.request.slice[0].date = date;

    console.time("[QPX-EXPRESS] From "+from+" to "+to+" on "+date);
    var req = https.request(options, function(response){
      response.on('end',function(){
        console.timeEnd("[QPX-EXPRESS] From "+from+" to "+to+" on "+date)
      });
      response.on('error', function(err){
        return callback(err,null);
      });
      response.on('data', function (chunk) {
        console.log('Response: ' + chunk);
        var result = JSON.parse(chunk);

        return callback(null,result);
      });

    });
    req.write(JSON.stringify(body));
    req.end();
  }

};
 
