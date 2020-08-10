const telemetrySeqModel = require('../models/telemetry.seqModel')
const historyRequestModel = require('../models/history-request.model.js')

function getTelemetry (req, res, next) {
    // parameters validity is checked at this point
    _extractStartEndTimestamps(req.query)
        .then(([start, end]) => {
            if (req.query.source === 'allPoints') {
                console.log("quering database for allpoints")
                telemetrySeqModel.retrieveAllPointsByStartEnd(start, end)
                    .then(timestampsValues => {
                        // setTimeout(() => {
                        //     res.status(201);
                        //     res.send(timestampsValues)  
                        // },20000)
                        res.status(201);
                        res.send(timestampsValues)            
                    })
            } else {
                telemetrySeqModel.retrieveSourceByStartEnd(req.query.source, start, end)
                    .then(timestampsValues => {
                        // setTimeout(() => {
                        //     res.status(201);
                        //     res.send(timestampsValues)  
                        // },20000)
                        res.status(201);
                        res.send(timestampsValues)            
                    })
            }
        })
}

function getSinglePoint(req, res, next){
    telemetrySeqModel.retrieveSingleValue(req.query.source, req.query.single)
        .then(val => {
            res.status(201)
            res.send(val)
        })
}

function getTimestamps(req, res, next) {
    _extractStartEndTimestamps(req.query)
        .then(([start, end]) => telemetrySeqModel.retrieveTimestampsByStartEnd(start, end))
        .then(timestamps => {
            // console.log("timestamps of requested window:", timestamps)
            res.status(201)
            res.send(timestamps)
        })   
}

function _extractStartEndTimestamps(reqestQuery) {

    switch (historyRequestModel.getCorrespondingGroupModelName(Object.keys(reqestQuery))) {
        case 'startToEnd':
            return Promise.resolve([reqestQuery.start, reqestQuery.end])
            break;

        case 'newestOfSize':
            return telemetrySeqModel.retrieveLastTimestamp().then(end => {
                let start = end - reqestQuery.diff;
                return ([start, end]);
            });           
            break;

        case 'newestTimestamps':
            return telemetrySeqModel.retrieveLastTimestamp().then(end => {
                let start = end - reqestQuery.diff;
                return ([start, end]);
            }); 
            break;
        
        case 'startToEndTimestamps': 
            return Promise.resolve([reqestQuery.start, reqestQuery.end])
            break;

        default:
            console.error('Unexpected Error: Model was not found after validation check!')
            break;
    }
    
}

module.exports = {
    getTelemetry,
    getTimestamps,
    getSinglePoint
}
