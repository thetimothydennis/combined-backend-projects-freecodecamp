import { fileMetadata } from "./jsCode/5-filemetadata.js";

export const getFileMetadata = (req, res) => {
    let analysis = fileMetadata(req);
    res.json(analysis);
};