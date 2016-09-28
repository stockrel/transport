var config = require('../config/config'),
    request = require('request'),
    objectmapper = require("object-mapper"),
    mapping = require('../mappings/skyscanner');

 
var createSession = {
  apiKey: config.skyscanner.key,
  country: "FR",
  currency: "EUR",
  locale: "fr",
  originplace: null,
  destinationplace: null,
  outbounddate: null,
  inbounddate: null,
  locationschema: "Iata",
  cabinclass: "Economy",
  adults: null,
  children: null,
  infants: null,
  groupricing: false
}

var pollSession = {
  apiKey: config.skyscanner.key,
  locationschema: "Iata",
  carrierschema: "Iata",
  sorttype: 'price',
  sortorder: 'asc',
  stops: 1,
  originalairports: null,
  destinationairports: null,
  outbounddeparttime: null,
  outbounddepartstarttime: null,
  outbounddepartendtime: null,
  inbounddeparttime: null,
  inbounddepartstarttime: null,
  inbounddepartendtime: null,
  duration: null,
  includecarriers: null,
  excludecarriers: null
}




module.exports = {
  
  search: function(payload,callback){
    
    if (!payload || payload === null){
      return calllback(new Error('Skyscanner : Empty payload'),null);
    }

    // PASSENGERS
    createSession.adults = payload.adults || 1;
    createSession.children = payload.children || 0;

    // SINGLE TRIP
    createSession.originplace = payload.from;
    createSession.destinationplace = payload.to;
    createSession.outbounddate = payload.singleDate;


    // RETURN TRIP
    if (payload.return){
      createSession.inbounddate = payload.returnDate;
    }
    //TODO: do not create a session each time, but for each user then use same session for different searches
    console.time("[SKYSCANNER] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
    request.post({
        url: config.skyscanner.host+config.skyscanner.path,
        form: createSession
    }, function (error, response, body) {
        console.timeEnd("[SKYSCANNER] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
        if (!error && response.statusCode === 201) {
            var sessionID = response.headers.location.split('/')[response.headers.location.split('/').length-1];
            var pollURL = response.headers.location;
            console.log("[SKYSCANNER] Session created (from "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? ": return on "+payload.returnDate+")" : ": one-way)"),
            ": session's identifier is "+sessionID);
            
            request({
                url: pollURL,
                method: "GET",
                headers: {
                  "accept": "application/json",
                  "content-type": "application/json"
                },
                qs: pollSession
            }, function (error, response, body) {

                if (!error && response.statusCode === 200) {
                    console.log("[SKYSCANNER] Session polled (from "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? ": return on "+payload.returnDate+")" : ": one-way)"));
                    
                    console.log(body);
                    return callback(null,JSON.parse(body))
                } else if (!error && response.statusCode === 410) {
                    console.log("[SKYSCANNER] SESSION EXPIRED (need to recreate a session)");
                    return callback(error,null)
                } else {
                    console.log("[SKYSCANNER] ERROR "+response.statusCode);
                    return callback(error,null)
                }
            })

        }else {
            console.log("[SKYSCANNER] ERROR "+response.statusCode);
            return callback(error,null)
        }
    })
  }


};
 
