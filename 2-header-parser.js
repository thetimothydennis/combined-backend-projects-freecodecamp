
module.exports.whoAmI = function whoAmI (req) {
    let responseObj = {}
    responseObj.ipAddr = req.header("x-forwarded-for");
    responseObj.language = req.header("accept-language");
    responseObj.software = req.header("user-agent");
    return responseObj
}
