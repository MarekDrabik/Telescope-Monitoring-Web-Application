const telemetryModel = require ('../models/telemetry.model')
const historyRequestModel = require ('../models/history-request.model.js.js')

//this doesnt provide validation for correct routes, only for correct values and completeness of parameters

paramSpecificValidators = {
    source: [
        function checkSourceNameIsRegistered(param) {
            if (!telemetryModel.getAllRequestableSources().includes(param)) {
                console.log('Invalid request: Invalid query "source": ', param, ". Source uknown.");
                return false;
            }
            return true;
        }        
    ],
    start: [
        function checkIsInteger(param) {  //checks also for +param is a number
            if (!Number.isSafeInteger(+param)) {
                console.log('Invalid request: Invalid query "start": ', param, ". Should be a safe integer number.");
                return false;
            }
            return true;
        },
        function checkIsntNegative(param) {
            if (+param < 0) {
                console.log('Invalid request: Invalid query "start": ', param, ". Cannot be negative number.");
                return false;
            }
            return true;
        }
    ],
    end: [
        function checkIsInteger(param) {  //checks also for +param is a number
            if (!Number.isSafeInteger(+param)) {
                console.log('Invalid request: Invalid query "end": ', param, ". Should be a safe integer number.");
                return false;
            }
            return true;
        },
        function checkIsntNegative(param) {
            if (+param < 0) {
                console.log('Invalid request: Invalid query "end": ', param, ". Cannot be negative number.");
                return false;
            }
            return true;
        }
    ],
    diff: [
        function checkIsInteger(param) {  //checks also for +param is a number
            if (!Number.isSafeInteger(+param)) {
                console.log('Invalid request: Invalid query "diff": ', param, ". Should be a safe integer number.");
                return false;
            }
            return true;
        },
        function checkIsntNegative(param) {
            if (+param < 0) {
                console.log('Invalid request: Invalid query "diff": ', param, ". Cannot be negative number.");
                return false;
            }
            return true;
        }
    ],
    endString: [
        function checkCaseValueEquals_newest (param) {
            if (param !== 'newest') {
                console.log('Invalid request: Invalid query "endString": ', param, '. Only "newest" value available for endString');
                return false;
            }
            return true;
        }
    ],
    single: [
        function checkIsInteger(param) {  //checks also for +param is a number
            if (!Number.isSafeInteger(+param)) {
                console.log('Invalid request: Invalid query "diff": ', param, ". Should be a safe integer number.");
                return false;
            }
            return true;
        },
        function checkIsntNegative(param) {
            if (+param < 0) {
                console.log('Invalid request: Invalid query "diff": ', param, ". Cannot be negative number.");
                return false;
            }
            return true;
        } 
    ]
}

groupSpecificValidators = {
    startToEnd: [
        function startSmallerThanEnd(req){
            if (+req.query['start'] > +req.query['end']){
                console.log('Invalid history request query params: ', req.query, ". 'start' value cannot be bigger than 'end' value");
                return false;
            }
            return true;
        }
    ],
    newestOfSize: [
        function () {}
    ],
    single: [
        function () {}
    ],
    newestTimestamps: [
        function () {}
    ],
    startToEndTimestamps: [
        function startSmallerThanEnd(req){
            if (+req.query['start'] > +req.query['end']){
                console.log('Invalid history request query params: ', req.query, ". 'start' value cannot be bigger than 'end' value");
                return false;
            }
            return true;
        }
    ]
}

function checkValidGroupRequested(req, res, next) {
    let corresGroup = historyRequestModel.getCorrespondingGroupModelName(Object.keys(req.query))
    if (corresGroup === null) {
        console.log('Invalid request: Requested query strings doesnt fit any of the possible models.')
        res.status(400)
        return res.send('invalid model')
    }
    return next();
}

function checkParamSpecificValidities(req, res, next) {
    let qString, qValue;
    for ([qString, qValue] of Object.entries(req.query)) {
        for(let validator of paramSpecificValidators[qString]){ //run every validator specific for this parameter
           if (validator(qValue)===false) { //if any validator return false
               res.status(400)
               return res.send('invalid param value')
           } 
        }
    }
    return next();
}

function checkGroupSpecificValidities(req, res, next) {
    let idOfThisGroup = historyRequestModel.getCorrespondingGroupModelName(Object.keys(req.query))
    let validatorsOfThisGroup = groupSpecificValidators[idOfThisGroup]
    for (let validator of validatorsOfThisGroup) {
        if (validator(req)===false) { //if any validator return false
            res.status(400)
            return res.send('invalid param relational values')
        } 
    }
    return next();
}



module.exports = { 
    checkValidGroupRequested, 
    checkParamSpecificValidities,
    checkGroupSpecificValidities
}