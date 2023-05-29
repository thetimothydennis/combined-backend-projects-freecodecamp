
module.exports.fileMetadata = function (req) {
    let responseObject = {};
    responseObject.name = req.file.originalname;
    responseObject.type = req.file.mimetype;
    responseObject.size = req.file.size;
    return responseObject;
}

