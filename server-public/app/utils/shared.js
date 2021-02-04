const fs = require('fs')
const ROOT_DIR = require('./rootDirPath')

module.exports = exp = {
    
    imagesAsBuffers: {
        'Winter Images': [],
        'default': []
    },

    initializeImages () { //fill imageAsBuffers array
        let folderPath = ROOT_DIR + "/assets/images/summer/"
        let files = fs.readdirSync(folderPath)
        for (let f of files) {
            var filePath = folderPath + f.toString()
            exp.imagesAsBuffers['default'].push(fs.readFileSync(filePath))
        }

        folderPath = ROOT_DIR + "/assets/images/winter/"
        files = fs.readdirSync(folderPath)
        for (let f of files) {
            var filePath = folderPath + f.toString()
            exp.imagesAsBuffers['Winter Images'].push(fs.readFileSync(filePath))
        }
    }
}

