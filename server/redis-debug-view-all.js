var client1 = require('./redis-client-user-to-doc.js').client;
var client2 = require('./redis-client-doc-to-user.js').client;

client1.multi().keys('*', function(err, keys) {
  if (err) throw err;

  keys.forEach(function(key, index) {
    client1.get(key, function(err, data) {
      if (err) throw err;
      console.log(key + ": " + data);
    });
  });
}).exec(function(a,b){});

client2.multi().keys('*', function(err, keys) {
  if (err) throw err;

  keys.forEach(function(key, index) {
    client2.get(key, function(err, data) {
      if (err) throw err;
      console.log(key + ": " + data);
    });
  });
}).exec(function(a,b){});
