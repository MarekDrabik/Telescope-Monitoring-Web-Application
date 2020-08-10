const telemetryModel = require('../models/telemetry.model')
const RealisticDataGenerator = require('../utils/realisticDataGenerator')
const ImageGenerator = require('../utils/imageGenerator')

//generates random measurement data based on telemetry-settings.json
class Spacecraft {

  static valueGenerator;

  constructor() {    
    //assign generator by telemetry name (if defined for that specific name), otherwise by telemetry type
    let batteryCurrentGenerator = new RealisticDataGenerator(1, 5, 10, 15)
    let engineCurrentGenerator = new RealisticDataGenerator(0.1, 2, 20, 30)
    let outsideTemperatureGenerator = new RealisticDataGenerator(-21, 5, 60, 20)
    let outsideHumidityGenerator = new RealisticDataGenerator(20, 90, 60, 30)
    let engineTemperatureGenerator = new RealisticDataGenerator(90, 99, 5, 3)
    let winterImageGenerator = new ImageGenerator('Winter Images')

    let defaultPointGenerator = new RealisticDataGenerator(10, 50, 40, 20)
    let defaultImageGenerator = new ImageGenerator()
    Spacecraft.valueGenerator = {
      'Engine Current': engineCurrentGenerator.generate,
      'Battery Current': batteryCurrentGenerator.generate,
      "Outside Temperature": outsideTemperatureGenerator.generate,
      "Outside Humidity": outsideHumidityGenerator.generate,
      "Engine Temperature": engineTemperatureGenerator.generate,
      "Winter Images": winterImageGenerator.generate,
      'point': defaultPointGenerator.generate,
      'image': defaultImageGenerator.generate
    }
  }
  
  //called once on server start
  startGenerating(callback) {
    setInterval(() => {
      var currentMeasurements = {
        timestamp: Date.now()
      }
      for (let tele of telemetryModel.getTelemetrySettings()) { //{name:,type:}
        // console.log('tele', tele)
        let newValue = this._generatorFunction(tele.type, tele.name)()
        if (tele.type === 'point') { //round to three decimal places
          newValue = +newValue.toFixed(3)
        }
        currentMeasurements[tele.name] = newValue;
      }
      //currentMeasurements: {timestamp: 1231452, 'starsImage': buffer, 'batCurrent': 123 ...}
      callback(currentMeasurements) //callback by database
    }, 2000)
  }
  
  _generatorFunction (telemetryType, telemetrySourceName) {
    if (Spacecraft.valueGenerator.hasOwnProperty(telemetrySourceName)) {
      return Spacecraft.valueGenerator[telemetrySourceName]
    }
    else {
      return Spacecraft.valueGenerator[telemetryType]
    }
  }
  
}

module.exports = Spacecraft
