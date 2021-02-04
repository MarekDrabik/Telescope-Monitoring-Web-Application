const settings = require('../utils/settings')
const shared = require('../utils/shared')
const fs = require('fs')
const ROOT_DIR = require('../utils/rootDirPath') 
const Util = require('../utils/utilities')

/*FORMAT:
[
    { name: 'batteryCurrent', type: 'point', unit: 'A' },
    { name: 'batteryVoltage', type: 'point', unit: 'A' },
    { name: 'starsImage', type: 'image', unit: null },
    { name: 'selfieImage', type: 'image', unit: null }
]*/
const _telemetrySettings = JSON.parse(fs.readFileSync(ROOT_DIR + '/telemetry-settings.json', 'utf8'))

// point telemetry is always provided all together by the server even if some sources aren't required
// this format defines the order of telemetry sources in such message
// eg: ['batteryCurrent', 'batteryVoltage']; order is defined by array
const _allPointsFormat = [];
for (let tele of _telemetrySettings) {
  if (tele["type"] === "point") {
    _allPointsFormat.push(tele["name"]);
  }
}

const _allPositionsFormat = [];
for (let tele of _telemetrySettings) {
  if (tele["type"] === "position") {
    _allPositionsFormat.push(tele["name"]);
  }
}

const _databaseTypes = {
  point: "DOUBLE",
  image: settings.imagesAreStoredAsIndexes ? "BIGINT" : "MEDIUMBLOB", //condition check for dummy updates,
  position: "JSON",
};

const _realtimeMessageComposers = {
  /* 'teleType': {
        messageComposer: function which composes a message for realtime communication from currentMeasurements object
    } */
  point: function (sourceName, currentMeasurements) {
    return JSON.stringify({
      timestamp: currentMeasurements.timestamp,
      value: currentMeasurements[sourceName],
      name: sourceName,
    });
  },
  allPoints: function (_, currentMeasurements) {
    return JSON.stringify({
      timestamp: currentMeasurements.timestamp,
      //value for all points is an array of measurements in the order of _allPointsFormat
      value: _allPointsFormat.map((source) => currentMeasurements[source]),
      name: "allPoints",
    });
  },
  allPositions: function (_, currentMeasurements) {
    return JSON.stringify({
      timestamp: currentMeasurements.timestamp,
      //value for all points is an array of measurements in the order of _allPointsFormat
      value: _allPositionsFormat.map((source) => currentMeasurements[source]),
      name: "allPositions",
    });
  },
  image: function (sourceName, currentMeasurements) {
    //returns buffer created from image,timestamp,sourceName - in that order and separated by comma
    let imageBuffer;
    if (settings.imagesAreStoredAsIndexes) {
      //image is index (number)
      //transform index to actual image buffer
      //REF: need refactoring, should be loaded dynamically, not manually stating the sourcename:
      let imagesAsBuffers = [];
      if (sourceName === "Winter Images") {
        imagesAsBuffers = shared.imagesAsBuffers["Winter Images"];
      } else {
        imagesAsBuffers = shared.imagesAsBuffers["default"];
      }
      imageBuffer = imagesAsBuffers[currentMeasurements[sourceName]];
    } else {
      //its a buffer
      //make copy of buffer as new instance which is important to not overwrite currentMeasurements
      //which would spoil them for other clients
      imageBuffer = Buffer.from(currentMeasurements[sourceName]); //copy
    }
    if (!Buffer.isBuffer(imageBuffer)) {
      console.error("imageBuffer variable was suppose to be buffer here!");
    }
    return Util.attachDataToImageBuffer(
      (buf = Util.attachDataToImageBuffer(
        (buf = imageBuffer),
        (data = currentMeasurements.timestamp)
      )),
      (data = sourceName)
    );
  }
};

module.exports = class TelemetryModel {
  static getTelemetrySettings() {
    return _telemetrySettings;
  }

  static getAllPointsFormat() {
    return _allPointsFormat;
  }

  static getAllRequestableSources() {
    const allRequestableSources = ["allPoints", "allPositions"];
    for (let tele of _telemetrySettings) {
      if (tele.type !== "position" && tele.type !== "point") {
        allRequestableSources.push(tele.name);
      }
    }
    console.log("requestable sources:", allRequestableSources);
    return allRequestableSources;
  }

  static getSourceNamesOfType(sourceType) {
    let names = [];
    for (let tele of _telemetrySettings) {
      if (tele.type === sourceType) {
        names.push(tele.name);
      }
    }
    return names;
  }
  static getType(sourceName) {
    for (let tele of _telemetrySettings) {
      if (tele.name === sourceName) {
        return tele.type;
      }
    }
  }
  static getDatabaseType(sourceType) {
    return _databaseTypes[sourceType];
  }

  static getMessageComposer(sourceName) {
    //allPoints is a special request where all point telemetry is provided together
    let searchPattern;
    switch (sourceName) {
      case "allPoints":
        searchPattern = "allPoints";
        break;
      case "allPositions":
        searchPattern = "allPositions";
        break;

      default:
        searchPattern = TelemetryModel.getType(sourceName);
        break;
    }
    return _realtimeMessageComposers[searchPattern]; //returns function
  }

  // return array specific to image source name if defined
  // otherwise return default images
  static getImagesArray(sourceName) {
    if (shared.imagesAsBuffers.hasOwnProperty(sourceName)) {
      return shared.imagesAsBuffers[sourceName];
    } else {
      return shared.imagesAsBuffers["default"];
    }
  }

  static getGroupFormat(telemetryGroupName) {
    switch (telemetryGroupName) {
      case "allPoints":
        return _allPointsFormat;
        break;

      case "allPositions":
        return _allPositionsFormat;
        break;

      default:
        break;
    }
  }
};
