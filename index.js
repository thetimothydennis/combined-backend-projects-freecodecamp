require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dnsPromises = require("dns/promises")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});

const time = require("./1-timestamp.js");
const headParse = require("./2-header-parser.js");
const shortURL = require("./3-url-shortener.js")
const exercise = require("./4-exercise-tracker.js");
const file = require("./5-filemetadata.js");

const multer = require('multer');
const upload = multer({ dest: './uploads/'});

const cors = require("cors");
app.use(cors({optionsSuccessStatus: 200})); 

app.use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
  });

 // endpoints for 1-timestamp 
 // if empty date is given, return current time
app.get("/api/", (req, res, next) => {
    req.newDate = new Date();
    req.unix = time.getUnixString(req.newDate);
    req.utc = time.getUTCString(req.newDate)
    next();
  }, 
    (req, res) => {
      res.json({ "unix": req.unix, "utc": req.utc });
    }
  );
// return date for given string




app.get("/api/:date", (req, res, next) => {
    // endpoint for 2-header-parser since they share an api endpoint
    if (req.params.date == "whoami") {
      res.redirect("/whoami")
    }
    else if (req.params.date == "users") {
      res.redirect("/api/users/allusers")
    }

    else {
    // string passes until proven false
    req.fails = false;
    // get the date keys using appropriate function
    req.utc = time.getUTCString(req.params.date);
    req.unix = time.getUnixString(req.params.date);
    if ((req.utc || req.unix) == "Invalid Date") {
      req.fails = true;
      next();
    };
    next();
    }
  },
    (req, res) => {
      if (!req.fails) {
        res.json({ "unix": req.unix, "utc": req.utc });
      }
      else {
        res.json({"error": "Invalid Date"});
      }
    }
  );


// endpoint for 2-header-parser since they share an api endpoint
 app.get("/whoami", (req, res) => {
  let parsed = headParse.whoAmI(req)
  res.json(parsed)
 }) 

// enpoints for 3 - url-shortener
app.post("/api/shorturl", (req, res) => {
  // first, check to see if req.body.url is in the database
  shortURL.findURL(req).then(
    findURL => {
      // if not, check that it is a valid URL
      if (findURL.length == 0) {
        // strip protocol prefix from url
        let separatorIndex = req.body.url.indexOf(":");
        let domainName = req.body.url.slice(separatorIndex + 3);
        if(domainName.startsWith("www.")) {
          domainName = domainName.slice(4)
        }
        // if there are parameters following domain name, strip them off for test
        if (domainName.match(/\//)) {
          let urlSeparator = domainName.indexOf("/");
          domainName = domainName.slice(0, urlSeparator);
        }
        return dnsPromises.lookup(domainName)
      }
      else if (findURL.length == 1) {
        return findURL
      }
    })
    .then(
      address => {
        if (typeof address == "string") return address
        else if ((typeof address == "object") && (!address[0])) return shortURL.saveURL(req)
      }
    )
    .then(
      () => {
        return shortURL.findURL(req)
      }
    ).then(
    findURL => res.send(findURL[0])
    ).catch(
      (error) => res.json({error: 'invalid url'})
    )
})

app.get("/api/shorturl/:shorturl", (req, res) => {
  shortURL.redirectShortURL(req)
  .then(url => res.redirect(url))
})

  // endpoints for 4 - exercise-tracker
  app.post("/api/users", (req, res) => {
    exercise.findUser(req).then(findUser => res.json({ username: req.body.username, "_id": findUser[0]._id }))
    .catch(error => console.log(error.message));
  });


  app.post("/api/users/:_id/exercises", (req, res) => {
    exercise.inputExercise(req).then(results => res.json({ _id: results._id, username: results.username, date: results.date, duration: results.duration, description: results.description }))
      .catch(error => console.log(error.message));
  });

  app.get("/api/users/:_id/logs", (req, res) => {
    exercise.getLogs(req).then(results => res.json({ _id: results._id, username: results.username, count: results.count, log: results.log }))
    .catch(error => console.log(error.message));
  });

  app.get("/api/users/allusers", (req, res) => {
    exercise.findAllUsers().then(results => res.send( results ))
    .catch(error => console.log(error.message));
  });

  // endpoints for 5 - metadata-handler
app.post("/api/fileanalyse", upload.single('upfile'), (req, res) => {
    let analysis = file.fileMetadata(req)
    res.json(analysis)
})

const listener1 = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener1.address().port);
});

const listener2 = app.listen(40191, function () {
    console.log("Your app is listening on port " + listener2.address().port)
})