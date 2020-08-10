
const settings = require('../utils/settings')
const shared = require('../utils/shared')
const TelemetryModel = require('../models/telemetry.model')

module.exports = class imageGenerator {

    sourceName;
    imagesAsBuffers;

    constructor(sourceName = null) {
        this.sourceName = sourceName;
        this.imagesAsBuffers = TelemetryModel.getImagesArray(sourceName);
    }

    generate = () => {
        let randomIndexInImages = Math.floor(Math.random() * this.imagesAsBuffers.length)
        if (settings.imagesAreStoredAsIndexes) { //return just an index of image in the folder
            return randomIndexInImages
        }
        else {
            let image = this.imagesAsBuffers[randomIndexInImages] //return buffered image
            return image
        }
    }
}