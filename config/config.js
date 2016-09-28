var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'transport'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/transport-development',
    qpx: {
      host: 'https://www.googleapis.com',
      path: '/qpxExpress/v1/trips/search',
      key: 'AIzaSyAw6YbY7ww697Q0HKmohcamH1-1q9YE8hY'
    },
    sncf: {
      host: 'https://api.sncf.com',
      path: '/v1/coverage/sncf/journeys',
      key: 'ebc3da58-1361-4a35-9458-c183558be660'
    },
    skyscanner: {
      host: 'http://partners.api.skyscanner.net',
      path: '/apiservices/pricing/v1.0/',
      key: 'ch952559412449752472692137627450'
    }
  },

  test: {
    root: rootPath,
    app: {
      name: 'transport'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/transport-test',
    qpx: {
      host: 'https://www.googleapis.com',
      path: '/qpxExpress/v1/trips/search',
      key: 'AIzaSyAw6YbY7ww697Q0HKmohcamH1-1q9YE8hY'
    },
    sncf: {
      host: 'https://api.sncf.com',
      path: '/v1/coverage/sncf/journeys',
      key: 'ebc3da58-1361-4a35-9458-c183558be660'
    },
    skyscanner: {
      host: 'http://partners.api.skyscanner.net',
      path: '/apiservices/pricing/v1.0/',
      key: 'ch952559412449752472692137627450'
    }
  },

  production: {
    root: rootPath,
    app: {
      name: 'transport'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/transport-production',
    qpx: {
      host: 'https://www.googleapis.com',
      path: '/qpxExpress/v1/trips/search',
      key: 'AIzaSyAw6YbY7ww697Q0HKmohcamH1-1q9YE8hY'
    },
    sncf: {
      host: 'https://api.sncf.com',
      path: '/v1/coverage/sncf/journeys',
      key: 'ebc3da58-1361-4a35-9458-c183558be660'
    },
    skyscanner: {
      host: 'http://partners.api.skyscanner.net',
      path: '/apiservices/pricing/v1.0/',
      key: 'ch952559412449752472692137627450'
    }
  }
};

module.exports = config[env];
