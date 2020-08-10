//token validation
const config = require('config')
const jwt = require("jsonwebtoken");
const jwtPrivateKey = config.get('jwtPrivateKey');

const domain = config.get('domain')
console.log('domain is', domain)
const checkIsAuthenticated = function (req, res, next) {
    if (req.cookies) {
        if (req.cookies.access_token) {
            var receivedToken = req.cookies.access_token;
            try {
                jwt.verify(receivedToken, jwtPrivateKey); //verify with environmen privatekey
                next();
                return;
            } catch(e) {
                console.log('Invalid / none token provided, denying access.', e.message);
            }
        }
    }
    res.redirect(domain +'/login'); //redirect to login page when cookie expires or not provided
    return;
}

module.exports = checkIsAuthenticated;
