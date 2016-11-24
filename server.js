var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

var mongo = require("mongodb").MongoClient;
var mongourl = process.env.MONGOLAB_URI || "mongodb://localhost:27017/data";

//Regex from https://gist.github.com/dperini/729294
var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i; /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

function rnum(){
    var num = Math.floor(10000 + Math.random() * 90000);
    return num.toString();
}

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.get("/:url*", function (req, res){
   var url = req.url.slice(1);
   if (regex.test(url) === true) {
       var reqrl = {"original_url": url};
       mongo.connect(mongourl, function(err, db){
          if (err) throw err;
          var collection = db.collection("urls");
          collection.findOne(reqrl, function(err, result){
             if(err) throw err;
             if (result === null){
                var full = {"original_url": url, "shortcut": rnum()};
                res.json(full);
                collection.insert(full, function(err, data){
                if (err) throw err;
                db.close();
                }); // add ends
             } else {
                var ready = result;
                ready._id = undefined;
                res.json(ready);
             }
          });
       }); // connection to mongo ends
   } //if regex true ends
   if (regex.test(url) === false) {
       mongo.connect(mongourl, function(err, db){
          if (err) throw err;
          var collection = db.collection("urls");
          collection.findOne({"shortcut": url}, function(err, result){
             if(err) throw err;
             if (result === null){
                 res.json({"error":"Wrong url format or wrong shortcut"});
             } else {
                 res.redirect(result.original_url);
             }
          });
       }); // connection to mongo ends
   } //if regex false ends
});

app.listen(port, function(){
   console.log("Listening on port " + port); 
});