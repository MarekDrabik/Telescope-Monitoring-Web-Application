const Sequelize = require('sequelize').Sequelize
const telemetryModel = require('../models/telemetry.model')
const settings = require('../utils/settings')
const sequelize = require('../utils/database')
const shared = require ('../utils/shared')

const tableName = 'newModel14';
const seqTypes = {
    "MEDIUMBLOB": Sequelize.BLOB('medium'), //for real image
    "DOUBLE": Sequelize.DOUBLE,
    "BIGINT": Sequelize.BIGINT
}

//columns in database correspond to telemetry.model
var columns = {}
for (let tele of telemetryModel.getTelemetrySettings()){
    //create separate schema for each different telemetry-settings.json
    let colName = tele.name
    let seqType = telemetryModel.getDatabaseType(tele.type)
    columns[colName] = {type: seqTypes[seqType], allowNull: true}
}
const Telemetry = sequelize.define(
    modelName = settings.imagesAreStoredAsIndexes ? tableName + '_imgAsInteger' : tableName + '_imgAsBlob',
    attributes={
        timestamp: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        ...columns
    }
)

Telemetry.retrieveSourceByStartEnd = function(reqSource, reqStart, reqEnd) {
    // console.log("DB request start - end:", reqSource, reqStart, reqEnd)
    return this.findAll({
        attributes: ['timestamp', reqSource] ,
        where: {
            'timestamp': {
                [Sequelize.Op.gte]: reqStart,
                [Sequelize.Op.lte]: reqEnd
            }
        }})
    .then(arrayOfInstances => {
        if (arrayOfInstances === []) {
            return []
        }
        else if (settings.imagesAreStoredAsIndexes && telemetryModel.getType(reqSource)==='image') {
            let imagesAsBuffers = telemetryModel.getImagesArray(reqSource)
            // use index of image (retrieved from DB) to get image buffer
            return arrayOfInstances.map(inst => {
                return [
                    instance.dataValues.timestamp, 
                    imagesAsBuffers[instance.dataValues[reqSource]] 
                ]
            })
        } else { //images are real buffers
            //extracts results in a form: [[timestamp, value], [timestamp, value] ...]
            return arrayOfInstances.map(inst => {
                return [inst.dataValues.timestamp, inst.dataValues[reqSource]]
            })
        }
    })
    .catch(err => console.error("DB error:", err))
}
Telemetry.retrieveAllPointsByStartEnd = function(reqStart, reqEnd) {
    let allPoints = telemetryModel.getAllPointsFormat()
    let attributes = [...allPoints]
    return this.findAll({
        attributes: ['timestamp', ...allPoints] ,
        where: {
            'timestamp': {
                [Sequelize.Op.gte]: reqStart,
                [Sequelize.Op.lte]: reqEnd
            }
        }})
    .then(arrayOfInstances => {
        if (arrayOfInstances === []) {
            return []
        }
        else {
            //extracts results in a form: [[timestamp, value, value, value...], ...]
            return arrayOfInstances.map(inst => {
                let returnArray = [];
                returnArray[0]=inst.dataValues.timestamp
                allPoints.forEach(sourceName => returnArray.push(inst.dataValues[sourceName]))
                return returnArray
            })
        }
    })
    .catch(err => console.error("DB error:", err))
}

Telemetry.retrieveTimestampsByStartEnd = function(reqStart, reqEnd) {
    return this.findAll({
        attributes: ['timestamp'] ,
        where: {
            'timestamp': {
                [Sequelize.Op.gte]: reqStart,
                [Sequelize.Op.lte]: reqEnd
            }
        }})
    .then(arrayOfInstances => {
        if (arrayOfInstances === []) {
            return []
        }
        else {
            //extracts results in a form: [[timestamp, value], [timestamp, value] ...]
            return arrayOfInstances.map(inst => {
                return inst.dataValues.timestamp
            })
        }
    })
    .catch(err => console.error("DB error:", err))
}

Telemetry.retrieveLastTimestamp = function() {
    return this.max('timestamp')
    .catch(err => console.error("DB error:", err))
}

Telemetry.retrieveSingleValue = function(reqSource, reqSingle) {
    let timestamp = +reqSingle;
    return this.findOne({
        attributes: ['timestamp', reqSource] ,
        where: {
            'timestamp': {
                [Sequelize.Op.eq]: reqSingle
            }
        }})
        .then(instance => {
            if (instance === null) {
                return null
            }
            //transform to image buffer if return imagesAreStoredAsIndexes
            else if (settings.imagesAreStoredAsIndexes && telemetryModel.getType(reqSource)==='image'){
                let imagesAsBuffers = telemetryModel.getImagesArray(reqSource)
                return [
                    instance.dataValues.timestamp, 
                    imagesAsBuffers[instance.dataValues[reqSource]]
                ]
            } else {
                //extracts results in a form: [timestamp, value]
                return [instance.dataValues.timestamp, instance.dataValues[reqSource]]
            }
        })
        .catch(err => console.error("DB error:", err))
}

module.exports = Telemetry
