var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Qpx = require('../connectors/qpx');

router.post('/search', function (req, res, next) {
  console.log(req.body)
  if (!req.body || req.body == null || req.body == {}){
    const err = new Error('Body not defined');
    err.status = 400;
    return next(err);
  }
  Qpx.search(req.body,function (err, data) {
    if (err) return next(err);
    res.status(200).send(data);
  });
});

module.exports = router;