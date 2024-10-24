const jwt = require("jsonwebtoken");


function auth(req, res, next) {
    const token = req.headers.authorization;

    const response = jwt.verify(token,"arjunchay");

    if (response) {
        req.userId = response.id;
        next();
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
}

module.exports =auth