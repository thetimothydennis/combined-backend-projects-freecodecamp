import express from "express";
const router = express.Router();
import * as time from "./controllers/time-and-header-parser-controller.js";
import * as shortURL from "./controllers/shorturl-controller.js";
import * as exercise from "./controllers/exercise-controller.js";
import * as metadata from "./controllers/file-metadata-controller.js";
import multer from "multer";
const upload = multer({ dest: './uploads/' });

// endpoint for 1-time-microservice
router.get("/api/", time.getTime);
// endpoint for 1-time-microservice and 2-header-parser since they share an api endpoint
router.get("/api/:whoami", time.getSpecificTime);
// enpoints for 3 - url-shortener
router.post("/api/shorturl", shortURL.getShortURL);
router.get("/api/shorturl/:shorturl", shortURL.redirectAShortURL);
  // endpoints for 4 - exercise-tracker
router.post("/api/users", exercise.postAUser);
router.post("/api/users/:_id/exercises", exercise.postAnExercise);
router.get("/api/users/:_id/logs", exercise.getUserLogs);
router.get("/api/users/allusers", exercise.getAllUsers);
// endpoints for 5 - metadata-handler
router.post("/api/fileanalyse", upload.single('upfile'), metadata.getFileMetadata);

export default router;