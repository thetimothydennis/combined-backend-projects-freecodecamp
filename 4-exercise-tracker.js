
const bodyParser = require("body-parser")

const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
});

const exerciseSchema = new mongoose.Schema({
  _uid: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    set: date => {
      return new Date(date)
    },
    get: date => {
      return date.toDateString()
    }
  }
});

const User = mongoose.model("User", userSchema);

const Exercise = mongoose.model("Exercise", exerciseSchema);

const findUserByID = async function(input) {
  try {
    let findAUser = await User.find({ "_id": input }, { "__v": 0 })
    return findAUser
  }
  catch(error) {
    console.log(error.message)
  }
};

module.exports.findUser = async function (req) {
  const findUser = await User.find({ username: req.body.username })

  if (findUser.length == 0){
    let user = new User({ username: req.body.username });
    await user.save()
    let findUserAgain = await User.find({ username: req.body.username });
    return findUserAgain;
  }
  else return findUser;
};

module.exports.inputExercise = async function (req) {
  try {
    let user = await findUserByID(req.params._id);
    let exerciseDate;

    if (!req.body.date) {
      exerciseDate = new Date();
    }
    else {
      exerciseDate = new Date(req.body.date);
    };

    const newExercise = new Exercise({ _uid: user[0]._id, description: req.body.description, duration: req.body.duration, date: exerciseDate });
    await newExercise.save();
    user[0].date = newExercise.date;
    user[0].duration = newExercise.duration;
    user[0].description = newExercise.description;
    return user[0];
  }
  catch (error) {
    console.log(error.message);
  };
};

module.exports.getLogs = async function (req) {
  let responseObject = {};
  try {
    let user = await findUserByID(req.params._id)
    responseObject._id = req.params._id;
    responseObject.username = user[0].username;
    let matchObj = {};
    if (!req.query.from && !req.query.to) {
      matchObj = { $match: {
        _uid: user[0].id
      } }
    }
    else if ((req.query.from.length > 0) && (!req.query.to)) {
      matchObj = { $match: {
        _uid: user[0].id,
        date: { $gte: new Date(req.query.from) }
      } };
    }
    else if (req.query.to.length > 0) {
      matchObj = { $match: {
        _uid: user[0].id,
        date: { $gte: new Date(req.query.from), $lte: new Date(req.query.to)}
      } };
    }

    let aggregateLogs = await Exercise.aggregate( 
      [ matchObj,
      {
        $project: {
          _id: 0,
          description: "$description",
          date: "$date",
          duration: "$duration"
        }
      }
      ] 
    );

    for (let i of aggregateLogs) {
      i.date = i.date.toDateString()
    };

    responseObject.count = aggregateLogs.length;
    responseObject.log = aggregateLogs;
    if (req.query.limit > 0) responseObject.log.splice(req.query.limit);
    return responseObject;
  }
  catch (error) {
    return console.log(error.message);
  };
};

module.exports.findAllUsers = async function () {
  try {
    let allUsers = await User.find({}, { "__v": 0 });
    return allUsers;
  }
  catch (error) {
    console.log(error.message);
  };
};