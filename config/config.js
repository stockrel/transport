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
    qpxKey: 'AIzaSyAw6YbY7ww697Q0HKmohcamH1-1q9YE8hY'
  },

  test: {
    root: rootPath,
    app: {
      name: 'transport'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/transport-test',
    qpxKey: 'AIzaSyAw6YbY7ww697Q0HKmohcamH1-1q9YE8hY'
  },

  production: {
    root: rootPath,
    app: {
      name: 'transport'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/transport-production',
    qpxKey: 'AIzaSyAw6YbY7ww697Q0HKmohcamH1-1q9YE8hY'
  }
};

module.exports = config[env];
