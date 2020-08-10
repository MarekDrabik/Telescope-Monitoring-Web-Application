module.exports = class Util {
    //attaches data at the end of buffer and returns it
    static attachDataToImageBuffer (buf, data) { //accepts
        let str = ''
        if (typeof data === 'string' || data instanceof String){
            str = data
        } else if (typeof data === 'number' || data instanceof Number) {
            str = data.toString() //timestamp as string
        } else {
            console.error('Input number or string expected.')
        }
        str = ',' + str //update str with a comma separator
        var attachedBuffer = Buffer.from(str, 'utf-8') //each character is 1 byte
        var updatedBuffer = Buffer.concat([buf, attachedBuffer])
        return updatedBuffer
    }
}