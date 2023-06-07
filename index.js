import "dotenv/config";
import express from "express";
const app = express();
import bodyParser from "body-parser";
import { readFile } from "node:fs/promises";
import cors from "cors";
import router from "./routes.js";

app.use(cors({optionsSuccessStatus: 200})); 
app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(router);

app.get("/", async (req, res) => {
    let homepage = await readFile("./views/index.html", { encoding: "utf8" })
    res.send(homepage);
  });

const listener = app.listen(3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
