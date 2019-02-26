var client1 = require('./redis-client-user-to-doc.js').client;

client1.flushdb(function (err, succeeded) {
  console.log(succeeded);
});

var client2 = require('./redis-client-doc-to-user.js').client;

client2.flushdb(function (err, succeeded) {
  console.log(succeeded);
});
