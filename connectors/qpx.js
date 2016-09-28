var config = require('../config/config'),
    request = require('request'),
    objectmapper = require("object-mapper"),
    mapping = require('../mappings/qpx');

 
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
        url: config.qpx.host+config.qpx.path+'?key='+config.qpx.key,
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(qpx)
    }, function (error, response, body) {
        console.timeEnd("[QPX-EXPRESS] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
        if (!error && response.statusCode === 200) {
            console.log(JSON.parse(body).trips.tripOption.length,"trips found")
            var result = objectmapper(JSON.parse(body),mapping);
            result.solutionsCount = JSON.parse(body).trips.tripOption.length;
            result.provider = "Google Flights (QPX)";
            return callback(null,result);
        }else {
            console.log(response)
            console.log("[QPX-EXPRESS] ERROR");
            return callback(error,null)
        }
    })
  }


};
 
