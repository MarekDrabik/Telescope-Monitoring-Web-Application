const Sequelize = require('sequelize').Sequelize
const telemetryModel = require('../models/telemetry.model')
const settings = require('../utils/settings')
const sequelize = require('../utils/database')
const shared = require ('../utils/shared')

const tableName = 'newModel20';
const seqTypes = {
    "MEDIUMBLOB": Sequelize.BLOB('medium'), //for real image
    "DOUBLE": Sequelize.DOUBLE,
    "BIGINT": Sequelize.BIGINT,
    "JSON": Sequelize.JSON
}

//columns in database correspond to telemetry.model
function getMainColumnsDefinition() {
    var mainColumns = {}
    for (let tele of telemetryModel.getTelemetrySettings()){
        //create separate schema for each different telemetry-settings.json
        let colName = tele.name
        let seqType = telemetryModel.getDatabaseType(tele.type)
        mainColumns[colName] = {type: seqTypes[seqType], allowNull: true}  
    }  
    return mainColumns;
}

const MainTelemetry = sequelize.define(
    modelName = settings.imagesAreStoredAsIndexes ? tableName + '_imgAsInt' : tableName + '_imgAsBlob',
    attributes={
        timestamp: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        ...getMainColumnsDefinition()
    }
)

MainTelemetry.retrieveSourceByStartEnd = function(reqSource, reqStart, reqEnd) {
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
        if (arrayOfInstances.length === 0) {
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
MainTelemetry.retrieveTelemetryGroupByStartEnd = function(telemetryGroupName, reqStart, reqEnd) {
    let telemetryGroup = telemetryModel.getGroupFormat(telemetryGroupName)
    return this.findAll({
        attributes: ['timestamp', ...telemetryGroup] ,
        where: {
            'timestamp': {
                [Sequelize.Op.gte]: reqStart,
                [Sequelize.Op.lte]: reqEnd
            }
        }})
    .then(arrayOfInstances => {
        if (arrayOfInstances.length === 0) {
            return []
        }
        else {
            //extracts results in a form: [[timestamp, value, value, value...], ...]
            const result = arrayOfInstances.map(inst => {
                let returnArray = [];
                returnArray[0]=inst.dataValues.timestamp
                telemetryGroup.forEach(sourceName => {
                    let value = inst.dataValues[sourceName];
                    if (typeof(value) === 'string') {
                        // case of JSON position format - horrible bug which was cause only by RPI server 
                        value = JSON.parse(value);
                    }
                    returnArray.push(value)
                })
                return returnArray
            })
            return result;
        }
    })
    
    .catch(err => console.error("DB error:", err))
}

MainTelemetry.retrieveTimestampsByStartEnd = function(reqStart, reqEnd) {
    return this.findAll({
        attributes: ['timestamp'] ,
        where: {
            'timestamp': {
                [Sequelize.Op.gte]: reqStart,
                [Sequelize.Op.lte]: reqEnd
            }
        }})
    .then(arrayOfInstances => {
        if (arrayOfInstances.length === 0) {
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

MainTelemetry.retrieveLastTimestamp = function() {
    return this.max('timestamp')
    .catch(err => console.error("DB error:", err))
}

MainTelemetry.retrieveSingleValue = function(reqSource, reqSingle) {
    //images only
    let timestamp = +reqSingle;
    return this.findOne({
        attributes: ['timestamp', reqSource] ,
        where: {
            'timestamp': {
                [Sequelize.Op.eq]: timestamp
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

module.exports = MainTelemetry