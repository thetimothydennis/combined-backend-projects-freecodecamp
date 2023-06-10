import { lookup } from "dns/promises";
import { findURL, saveURL, redirectShortURL } from "./jsCode/3-url-shortener.js";

export const getShortURL = async (req, res) => {
  try {
    // first, check to see if req.body.url is in the database
    let findAURL = await findURL(req);
      // if not, check that it is a valid URL
    if (findAURL.length == 1) {
      res.send(findAURL);
    }
    else if (findAURL.length == 0) {
        // strip protocol prefix from url
      let separatorIndex = req.body.url.indexOf(":");
      let domainName = req.body.url.slice(separatorIndex + 3);
        // slice off www if present for domain name lookup
      if(domainName.startsWith("www.")) {
        domainName = domainName.slice(4);
      };
        // if there are parameters following domain name, strip them off for test
      if (domainName.match(/\//)) {
        let urlSeparator = domainName.indexOf("/");
        domainName = domainName.slice(0, urlSeparator);
      };
        // lookup domain name using dns promises library
      const address = await lookup(domainName);
      if ((typeof address == "object") && (!address[0])) {
        const save = await saveURL(req);
        findAURL = await findURL(req);
        res.send(findAURL[0]);
      };
    };
  }
  catch(error) {
    res.json({error: 'invalid url'});
  }
};

export const redirectAShortURL = async (req, res) => {
    try {
      let url = await redirectShortURL(req);
      res.redirect(url);
    }
    catch (error) {
      console.log(error.message);
    };
  };