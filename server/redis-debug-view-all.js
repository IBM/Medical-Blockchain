var client = require('./redis-client.js').client;

client.multi().keys('*', function(err, keys) {
  if (err) throw err;

  keys.forEach(function(key, index) {
    client.get(key, function(err, data) {
      if (err) throw err;
      console.log(key + ": " + data);
    });
  });
}).exec(function(a,b){});
