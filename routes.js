import express from "express";
const router = express.Router();
import bodyParser from "body-parser";
import { lookup } from "dns/promises";
import { getUTCString, getUnixString } from "./1-timestamp.js";
import { whoAmI } from "./2-header-parser.js";
import { findURL, saveURL, redirectShortURL } from "./3-url-shortener.js";
import { findUser, inputExercise, getLogs, findAllUsers } from "./4-exercise-tracker.js";
import { fileMetadata } from "./5-filemetadata.js";
import multer from "multer";
const upload = multer({ dest: './uploads/'});

router.get("/api/", (req, res, next) => {
    req.newDate = new Date();
    req.unix = getUnixString(req.newDate);
    req.utc = getUTCString(req.newDate)
    next();
  }, 
    (req, res) => {
      res.json({ "unix": req.unix, "utc": req.utc });
    }
  );

// endpoint for 2-header-parser since they share an api endpoint
 router.get("/api/:whoami", (req, res) => {
  if (req.params.whoami == "whoami") {
    let parsed = whoAmI(req)
    res.json(parsed)
  }
  else if (req.params.whoami == "users") {
    res.redirect("/api/users/allusers")
  }
  else {
    // endpoint for 1-timestamp date input
    let responseObj = {}
    // get the date keys using appropriate function
    req.utc = getUTCString(req.params.whoami);
    req.unix = getUnixString(req.params.whoami);
    if ((req.utc || req.unix) == "Invalid Date") {
      responseObj = {"error": "Invalid Date"}
    }
    else {responseObj = {"unix": req.unix, "utc": req.utc }}
    res.json(responseObj)
  }})
 
// enpoints for 3 - url-shortener
router.post("/api/shorturl", (req, res) => {
  // first, check to see if req.body.url is in the database
  findURL(req).then(
    findURL => {
      // if not, check that it is a valid URL
      if (findURL.length == 0) {
        // strip protocol prefix from url
        let separatorIndex = req.body.url.indexOf(":");
        let domainName = req.body.url.slice(separatorIndex + 3);
        // slice off www if present for domain name lookup
        if(domainName.startsWith("www.")) {
          domainName = domainName.slice(4)
        }
        // if there are parameters following domain name, strip them off for test
        if (domainName.match(/\//)) {
          let urlSeparator = domainName.indexOf("/");
          domainName = domainName.slice(0, urlSeparator);
        }
        // lookup domain name using dns promises library
        return lookup(domainName);
      }
      // if findURL returns an entry, pass it on
      else if (findURL.length == 1) {
        return findURL
      }
    })
    .then(
      address => {
        // if the value returned is a string, it was returned from the original findURL call, and is passed on to the next link in the chain
        if (typeof address == "string") return address
        // if the value returned is an object, DNS lookup passed, and it is saved to the db
        else if ((typeof address == "object") && (!address[0])) return saveURL(req)
      }
    )
    .then(
      () => {
        // final call of findURL, returns the newly saved url from the db
        return findURL(req)
      }
    ).then(
      // sends the record retrieved from the db
    findURL => res.send(findURL[0])
    ).catch(
      (error) => res.json({error: 'invalid url'})
    )
})

router.get("/api/shorturl/:shorturl", async (req, res) => {
  try {
    let url = await redirectShortURL(req);
    res.redirect(url);
  }
  catch (error) {
    console.log(error.message)
  };
});

  // endpoints for 4 - exercise-tracker
router.post("/api/users", async (req, res) => {
  try {
    let findAUser = await findUser(req);
    res.json({ username: req.body.username, "_id": findAUser[0]._id })
  }
    catch (error) {
      console.log(error.message)
  };
});

router.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    let results = await inputExercise(req)
    res.json({ _id: results._id, username: results.username, date: results.date, duration: results.duration, description: results.description })    
  }
  catch (error) {
    console.log(error.message)
  };
});

router.get("/api/users/:_id/logs", async (req, res) => {
  try {
    let results = await getLogs(req);
    res.json({ _id: results._id, username: results.username, count: results.count, log: results.log })  ;
  }
  catch (error) {
    console.log(error.message);
  };
});

router.get("/api/users/allusers", async (req, res) => {
  try {
    let results = await findAllUsers();
    res.send(results); 
  }
  catch (error) {
    console.log(error.message);
  };
});

// endpoints for 5 - metadata-handler
router.post("/api/fileanalyse", upload.single('upfile'), (req, res) => {
    let analysis = fileMetadata(req);
    res.json(analysis);
});

export default router;