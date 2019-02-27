const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const log4js = require('log4js');
const uuid = require('uuid/v4');

var redisClientUserToDoc = require('./redis-client-user-to-doc.js').client;
var redisClientDocToUser = require('./redis-client-doc-to-user.js').client;
var logger = log4js.getLogger();
logger.level = 'debug';
logger.debug("launching medrec backend");

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH');
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

app.post('/aclusertodoc', function(req, res) {
  var redisClient = redisClientUserToDoc;

  logger.debug("-- POST /aclusertodoc");
  console.log(req.body.users);
  console.log(req.body.doc);

  for (var userId of req.body.users) {
    redisClient.get(userId, function(err, result) {
      if (err)
        throw err;

      if (result) {
        result = JSON.parse(result);
        result.push(req.body.doc);
        redisClient.set(userId, JSON.stringify(result));
      } else {
        result = [req.body.doc];
        redisClient.set(userId, JSON.stringify(result));
      }
    });
  }

  logger.debug("-- Complete...");
  
  res.status(200).send({
    status: "complete"
  });
});

app.get('/aclusertodoc/:uid', function(req, res) {
  var redisClient = redisClientUserToDoc;
  
  logger.debug("-- GET /aclusertodoc/");

  var uid = req.params.uid;
  console.log("uid: " + uid);

  redisClient.get(uid, function(err, result) {
    if (err)
      throw err;

    console.log(result);
    res.status(200).send(JSON.stringify(result));
  });
});

app.post('/acldoctouser', function(req, res) {
  var redisClient = redisClientDocToUser;
  
  logger.debug("-- POST /acldoctouser");
  console.log(req.body.users);
  console.log(req.body.docId);

  redisClient.get(req.body.docId, function(err, result) {
    if (err)
      throw err;

    if (result) {
      result = JSON.parse(result);
      result.push(...req.body.users);
      redisClient.set(req.body.docId, JSON.stringify(result));
    } else {
      result = req.body.users;
      redisClient.set(req.body.docId, JSON.stringify(result));
    }
  });

  logger.debug("-- Complete...");
  
  res.status(200).send({
    status: "complete"
  });
});

app.get('/acldoctouser/:docid', function(req, res) {
  var redisClient = redisClientDocToUser;
  
  logger.debug("-- GET /acldoctouser/");

  var docId = req.params.docid;
  console.log("docId: " + docId);

  redisClient.get(docId, function(err, result) {
    if (err)
      throw err;

    console.log(result);
    res.status(200).send(JSON.stringify(result));
  });
});

app.patch('/aclusertodoc', function(req, res) {
  var redisClient = redisClientUserToDoc;
  
  logger.debug("-- DELETE /aclusertodoc");
  console.log(req.body.userId);
  console.log(req.body.docId);

  redisClient.get(req.body.userId, function(err, result) {
    if (err)
      throw err;

    if (result) {
      result = JSON.parse(result);
      for (var index in result) {
        if (result[index].id == req.body.docId) {
          result.splice(index, 1);
          break;
        }
      }
      redisClient.set(req.body.userId, JSON.stringify(result));
    }
  });

  logger.debug("-- Complete...");
  
  res.status(200).send({
    status: "complete"
  });
});

app.patch('/acldoctouser', function(req, res) {
  var redisClient = redisClientDocToUser;
  
  logger.debug("-- DELETE /acldoctouser");
  console.log(req.body.docId);
  console.log(req.body.userId);

  redisClient.get(req.body.docId, function(err, result) {
    if (err)
      throw err;

    if (result) {
      result = JSON.parse(result);
      for (var index in result) {
        if (result[index].id == req.body.userId) {
          result.splice(index, 1);
          break;
        }
      }
      redisClient.set(req.body.docId, JSON.stringify(result));
    }
  });

  logger.debug("-- Complete...");
  
  res.status(200).send({
    status: "complete"
  });
});

app.listen(8081, function() {
  console.log("Server is listening on port " + 8081);
});
