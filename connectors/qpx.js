var config = require('../config/config'),
    request = require('request');;

var apiKey = config.qpxKey;
 
var qpx = {
  request: {
    passengers: {
      kind: "qpxexpress#passengerCounts",
      adultCount: 1,
      childCount: 0
    },
    slice: [],
    solutions:10
  }
};
var url = 'https://www.googleapis.com/qpxExpress/v1/trips/search?key='+apiKey;

module.exports = {
  
  search: function(payload,callback){
    
    if (!payload || payload === null){
      return calllback(new Error('QPX-Express : Empty payload'),null);
    }

    // PASSENGERS
    qpx.request.passengers.adultCount = payload.adults || 1;
    qpx.request.passengers.childCount = payload.children || 0;

    // SINGLE TRIP
    qpx.request.slice.push({
      origin: payload.from,
      destination: payload.to,
      date: payload.singleDate,
      maxStops: 1
    })

    // RETURN TRIP
    if (payload.return){
      qpx.request.slice.push({
        origin: payload.to,
        destination: payload.from,
        date: payload.returnDate,
        maxStops: 1
      })
    }
    console.time("[QPX-EXPRESS] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(qpx)
    }, function (error, response, body) {
        console.timeEnd("[QPX-EXPRESS] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
        if (!error && response.statusCode === 200) {
            var results = [];
            // console.log(response)
            return callback(null,body);
        }else {
            console.log(response)
            console.log("[QPX-EXPRESS] ERROR");
            // console.log("[QPX-EXPRESS] response.statusCode: " + response.statusCode)
            // console.log("[QPX-EXPRESS] response.statusText: " + response.body.error.message)
            return callback(error,null)
        }
    })
  }


};
 
