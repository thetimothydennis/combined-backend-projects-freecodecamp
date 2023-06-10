import { findUser, inputExercise, getLogs, findAllUsers } from "./jsCode/4-exercise-tracker.js";

export const postAUser = async (req, res) => {
    try {
      let findAUser = await findUser(req);
      res.json({ username: req.body.username, "_id": findAUser[0]._id });
    }
      catch (error) {
        console.log(error.message);
    };
  };

  export const postAnExercise = async (req, res) => {
    try {
      let results = await inputExercise(req);
      res.json({ _id: results._id, username: results.username, date: results.date, duration: results.duration, description: results.description });
    }
    catch (error) {
      console.log(error.message);
    };
  };

  export const getUserLogs = async (req, res) => {
    try {
      let results = await getLogs(req);
      res.json({ _id: results._id, username: results.username, count: results.count, log: results.log });
    }
    catch (error) {
      console.log(error.message);
    };
  };

  export const getAllUsers = async (req, res) => {
    try {
      let results = await findAllUsers();
      res.send(results); 
    }
    catch (error) {
      console.log(error.message);
    };
  };