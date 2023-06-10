import autoIncrement from "mongoose-plugin-autoinc";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const connection = mongoose.createConnection(process.env.MONGO_URI);

const ShortURLSchema = new mongoose.Schema({
  original_url: { 
    type: String, 
    required: true, 
    unique: true 
  }
});

ShortURLSchema.plugin(autoIncrement.plugin, {
  model: 'shortURL', 
  field: "short_url"
});

const shortURL = connection.model("shortURL", ShortURLSchema);
  
export async function findURL (req) {
    const aggregateArr = [ { 
      $match: { 
        original_url: `${req.body.url}` 
      } 
    }, 
    { 
      $project: { 
        original_url: "$original_url", 
        short_url: "$short_url", 
        _id: 0 
      } 
    } ];
    const findURL = await shortURL.aggregate(aggregateArr);
    return findURL;
  };
  
export async function saveURL (req) {
    let original_url = new shortURL({ original_url: req.body.url });
    await original_url.save();
    console.log("saved into db");
    return;
  };
  
export async function redirectShortURL (req) {
    const findOriginalURL = await shortURL.find({ short_url: req.params.shorturl });
    return findOriginalURL[0].original_url;
  };