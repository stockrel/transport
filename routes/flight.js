var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Qpx = require('../connectors/qpx'),
  Skyscanner = require('../connectors/skyscanner');

router.post('/search', function (req, res, next) {
  console.log(req.body)
  if (!req.body || req.body == null || req.body == {}){
    const err = new Error('Body not defined');
    err.status = 400;
    return next(err);
  }
  Qpx.search(req.body,function (err, data) {
    if (err) return next(err);
    res.status(200).json(data);
  });
});

router.post('/search/skyscanner', function (req, res, next) {
  console.log(req.body)
  if (!req.body || req.body == null || req.body == {}){
    const err = new Error('Body not defined');
    err.status = 400;
    return next(err);
  }
  Skyscanner.search(req.body,function (err, data) {
    if (err) return next(err);
    res.status(200).json(data);
  });
});

module.exports = router;