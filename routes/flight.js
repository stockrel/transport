var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Qpx = require('../connectors/qpx');

router.get('/search/:from/:to/:date', function (req, res, next) {
  var from = req.params.from;
  var to = req.params.to;
  var date = req.params.date;
  Qpx.search(from, to, date,function (err, data) {
    if (err) return next(err);
    res.status(200).send(data);
  });
});

module.exports = router;