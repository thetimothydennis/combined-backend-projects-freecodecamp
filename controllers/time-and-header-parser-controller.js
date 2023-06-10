import { getUTCString, getUnixString } from "./jsCode/1-timestamp.js";
import { whoAmI } from "./jsCode/2-header-parser.js";

export const getTime = (req, res, ) => {
    let newDate = new Date();
    let unix = getUnixString(newDate);
    let utc = getUTCString(newDate);
    res.json({ unix, utc });
};

export const getSpecificTime = (req, res) => {
    if (req.params.whoami == "whoami") {
      let parsed = whoAmI(req);
      res.json(parsed);
    }
    else if (req.params.whoami == "users") {
      res.redirect("/api/users/allusers");
    }
    else {
      // endpoint for 1-timestamp date input
      let responseObj = {}
      // get the date keys using appropriate function
      let utc = getUTCString(req.params.whoami);
      let unix = getUnixString(req.params.whoami);
      if ((utc || unix) == "Invalid Date") {
        responseObj = { "error": "Invalid Date" };
      }
      else {
        responseObj = { unix, utc }
      };
      res.json(responseObj);
    }
};