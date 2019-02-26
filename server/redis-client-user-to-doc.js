const redis = require('redis');
var config = require('./config.json');
const {URL} = require('url');

let redisServices = config.services["databases-for-redis"];

let creds = redisServices[0].credentials;

var connectionString = creds.uri;

var client = null;

if (connectionString.startsWith("rediss://")) {
  opts = {
    tls: {
      servername: new URL(connectionString).hostname
    }
  }

  if ("ca_certificate_base64" in creds) {
    opts.tls.ca = new Buffer.from(creds.ca_certificate_base64, "base64");
  }
  client = redis.createClient(connectionString, opts);
} else {
  client = redis.createClient(connectionString);
}

var exports = module.exports = {};

exports.client = client;
