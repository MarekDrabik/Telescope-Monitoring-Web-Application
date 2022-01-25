//token validation
const config = require('config')
const jwt = require("jsonwebtoken");
const jwtPrivateKey = config.get('jwtPrivateKey');

const domain = config.get('domain')
console.log('domain is', domain)

const checkIsAuthenticated = function (req, res, next) {
   if (validateRequest(req)) {
   	next();
   	return;
   }
   res.status(401).send(); // unauthorized
   return;
}

function validateRequest (req) {
    if (req.cookies) {
	const token = req.cookies.access_token
        if (token) {
		if(validateToken(token)){
			return true;
		}
	}
    }
    return false;
}

function validateToken (token) {
    try {
      	jwt.verify(token, jwtPrivateKey); //verify with environmen privatekey
    } catch(e) {
	return false;
    }
    return true;
}

module.exports = {
	checkIsAuthenticated,
	validateToken,
	validateRequest,
}
