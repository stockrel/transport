var config = require('../config/config'),
    request = require('request'),
    objectmapper = require("object-mapper"),
    mapping = require('../mappings/skyscanner'),
    async = require('async'),
    _ = require('lodash'),
    moment = require('moment');
require('moment-range');

 
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

function getById(array,id){
  return _.find(array,{ 'Id' : id})
}

_.mixin({
  'findByValues': function(collection, property, values) {
    return _.filter(collection, function(item) {
      return _.contains(values, item[property]);
    });
  }
});

function populateSegment(segment, places, agents, carriers){
  var result = {
      "Id": segment.Id,
      "OriginStation": _.find(places, { 'Id': segment.OriginStation } ),
      "DestinationStation": _.find(places, { 'Id': segment.DestinationStation } ),
      "DepartureDateTime": segment.DepartureDateTime,
      "ArrivalDateTime": segment.ArrivalDateTime,
      "Carrier": _.find(carriers, { 'Id': segment.Carrier } ),
      "OperatingCarrier": _.find(carriers, { 'Id': segment.Carrier } ),
      "Duration": segment.Duration,
      "FlightNumber": segment.FlightNumber,
      "JourneyMode": segment.JourneyMode,
      "Directionality": segment.Directionality
    }
    return result;
}

function filterByArray(collections,filter){
  return _.filter(collections, function(p){
      return _.includes(filter, p.Id);
  });
}

function populateLeg(leg, segments, places, agents, carriers){
  var result = {
      "Id": leg.Id,
      "SegmentIds": filterByArray(segments,leg.SegmentIds),
      "OriginStation": _.find(places, { 'Id': leg.OriginStation } ),
      "DestinationStation": _.find(places, { 'Id': leg.DestinationStation } ),
      "Departure": leg.Departure,
      "Arrival": leg.Arrival,
      "Duration": leg.Duration,
      "JourneyMode": leg.JourneyMode,
      "Stops": filterByArray(places,leg.Stops),
      "Carriers": filterByArray(carriers,leg.Carriers),
      "OperatingCarriers": filterByArray(carriers,leg.OperatingCarriers),
      "Directionality": leg.Directionality,
      "FlightNumbers": leg.FlightNumbers
    }
    return result;
}

function populateItinerary(itinerary, legs, places, agents, carriers, callback){
    var result = itinerary;
    result.OutboundLegId = _.find(legs, { 'Id': itinerary.OutboundLegId } );
    result.InboundLegId = _.find(legs, { 'Id': itinerary.InboundLegId } );
    async.forEach(itinerary.PricingOptions,function(price,callback){
      price.Agents = filterByArray(agents,price.Agents);
      callback();
    },function(err){
      if (err) return(err,null);
      return callback(null,result);
    })
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

    // CABIN CLASS
    createSession.cabinclass = payload.cabinClass || "Economy";

    // RETURN TRIP
    if (payload.return){
      createSession.inbounddate = payload.returnDate;
    }
    //TODO: do not create a session each time, but for each user then use same session for different searches
    console.time("[SKYSCANNER] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
    request.post({
        url: config.skyscanner.host+config.skyscanner.search_path,
        form: createSession
    }, function (error, response, body) {
        console.timeEnd("[SKYSCANNER] From "+payload.from+" to "+payload.to+" on "+payload.singleDate+(payload.return ? " with return on "+payload.returnDate : "(one-way)"));
        if (!error && response.statusCode === 201) {

            var sessionID = response.headers.location.split('/')[response.headers.location.split('/').length-1];
            var pollURL = response.headers.location;

            pollSession.stops = payload.stops || 1;

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
                    
                    var result = JSON.parse(body);
                    var places = result.Places;
                    var agents = result.Agents;
                    var carriers = result.Carriers;
                    var legs = result.Legs;
                    var segments = result.Segments;
                    var itineraries = result.Itineraries;
                    var populatedSegments = [];
                    var populatedLegs = [];
                    var populatedItineraries = [];

                    console.log(result)

                    async.forEach(segments,function(segment,callback){
                      
                      populatedSegments.push(populateSegment(segment,places,agents,carriers));

                      callback();
                    },function(err){
                      if (err)  return callback(err,null);

                      async.forEach(legs,function(leg,callback){
                      
                        populatedLegs.push(populateLeg(leg, populatedSegments, places, agents, carriers));

                        callback();
                      },function(err){
                        if (err)  return callback(err,null);

                        async.forEach(itineraries,function(itinerary,callback){
                          // console.log(itinerary)
                          populateItinerary(itinerary, populatedLegs, places, agents, carriers, function(err,result){
                            if (err) return callback(err,null);
                            populatedItineraries.push(result);
                            callback();
                          });

                          
                        },function(err){
                          if (err)  return callback(err,null);
                          var fullResult = {
                            query : result.Query,
                            flights : populatedItineraries
                          }
                          return callback(null,fullResult)
                        })
                      })
                    })
                    
                    
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
  },

  browseDays: function(payload,callback){
    
    if (!payload || payload === null){
      return calllback(new Error('Skyscanner : Empty payload'),null);
    }

    //BEGINNING OF URL TO BROWSE FLIGHTS
    var browse_url = config.skyscanner.host + config.skyscanner.browse_path + '/FR/EUR/fr/' + payload.from + '/' + payload.to + '/'


    // CONTRUCT DATES RANGES
    console.log("[SKYSCANNER][BROWSING] Browsing dates +/- "+(payload.flexible ? payload.flexible : 5)+" days "+(payload.flexible ? "(payload)" : "(default)"));
    var startSingle = moment(payload.singleDate, "YYYY-MM-DD").add(-(payload.flexible ? payload.flexible : 5),'days');
    var endSingle = moment(payload.singleDate, "YYYY-MM-DD").add((payload.flexible ? payload.flexible : 5),'days');
    var rangeSingle = moment.range(startSingle, endSingle);

    if (payload.return && payload.return != undefined){
      var startReturn = moment(payload.returnDate, "YYYY-MM-DD").add(-(payload.flexible ? payload.flexible : 5),'days');
      var endReturn = moment(payload.returnDate, "YYYY-MM-DD").add((payload.flexible ? payload.flexible : 5),'days');
      var rangeReturn = moment.range(startReturn, endReturn);
    }

    var quotes = [];
    var cpt = 0;
    async.eachSeries(rangeSingle.toArray('days'),function(singleDate,callback){    
     
      var datepart = moment(singleDate).format("YYYY-MM-DD");
      if (payload.return){
        datepart += '/' + moment(rangeReturn.toArray('days')[cpt]).format("YYYY-MM-DD");
      }
      console.log(cpt)
      console.time("[SKYSCANNER][BROWSING] From "+payload.from+" to "+payload.to+" on "+moment(singleDate).format("YYYY-MM-DD")+(payload.return ? " with return on "+moment(rangeReturn.toArray('days')[cpt]).format("YYYY-MM-DD") : "(one-way)"));
      request.get({
          url: browse_url + datepart + '?apiKey='+config.skyscanner.key
      }, function (error, response, body) {
          console.timeEnd("[SKYSCANNER][BROWSING] From "+payload.from+" to "+payload.to+" on "+moment(singleDate).format("YYYY-MM-DD")+(payload.return ? " with return on "+moment(rangeReturn.toArray('days')[cpt]).format("YYYY-MM-DD") : "(one-way)"));
          if (!error && response.statusCode === 200) {
              quotes = _.concat(quotes,JSON.parse(body).Quotes);
              cpt++;
              callback();
          }else {
              console.log("[SKYSCANNER] ERROR "+response.statusCode);
              cpt++;
              callback();
          }
      })
    },function(err){
      if (err) return callback(err,null);

      return callback(null,quotes);
    })
  }
  

};
 
