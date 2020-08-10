
module.exports = class RealisticDataGenerator {
    
    G0; G1; Y;
    L0; L1;
    globalDisruptionRate; // number between 0 - 100 which specifies how often should global trend change, 0 means every time
    globalDisruptionRate_count = 0;
    localDisruptionRate;
    localDisruptionRate_count = 0; // number between 0 - 100 which specifies how often should local trend change, 0 means every time

    constructor (G0, G1, globalDisruptionRate, localDisruptionRate) {
        this.G0 = G0;
        this.G1 = G1;
        if (globalDisruptionRate < 0 || globalDisruptionRate > 100) {
            console.error('globalDisruptionRate is suppose to be in interaval 0 - 100.')
        }
        this.globalDisruptionRate = globalDisruptionRate;

        if (localDisruptionRate < 0 || localDisruptionRate > 100) {
            console.error('globalDisruptionRate is suppose to be in interaval 0 - 100.')
        }
        this.localDisruptionRate = localDisruptionRate;
        // generate initial global trend value Y
        this.Y = this._generateValueBetween(this.G0, this.G1)
        // generate initial local interval
        this._generateNewLocalInterval()
    }

    generate = () => {
        // generate new global trend value Y if the time has come:
        if (this.globalDisruptionRate_count === this.globalDisruptionRate) {
            this.Y = this._generateValueBetween(this.G0, this.G1)
            this.globalDisruptionRate_count = 0; //reset counter
        } else {
            this.globalDisruptionRate_count ++;
        }
        // generate new local interval if the time has come:
        if (this.localDisruptionRate_count === this.localDisruptionRate) {
            this._generateNewLocalInterval()
            this.localDisruptionRate_count = 0; //reset counter
        } else {
            this.localDisruptionRate_count ++;
        }

        let localValue = this._generateValueBetween(this.L0, this.L1)

        return this.Y + localValue;
    }

    _generateNewLocalInterval = () =>  {
        //local interval is interval which both boundaries values are in global interval
        let l0 = 0; let l1 = 0;
        //local interval can be max 2/3 of global interval size;
        let localIntervalTemplate = this._normalizeInterval(this.G0, this.G1).map(v => v*2/3)
        // avoid 0 lenght interval
        while (l0 === l1) { 
            l0 = this._generateValueBetween(localIntervalTemplate[0], localIntervalTemplate[1]);
            l1 = this._generateValueBetween(localIntervalTemplate[0], localIntervalTemplate[1]);
        }
        // make sure L0 < L1
        if (l1 < l0) {
            let temporary = l1;
            l1 = l0;
            l0 = temporary;
        }
        //normalize (0 is center of interval)
        this.L0 = l0;
        this.L1 = l1;
    }

    _normalizeInterval(lowerBound, upperBound) {
        let rangeSize = upperBound - lowerBound;
        return [0 - rangeSize/2, 0 + rangeSize/2]
    }

    _generateValueBetween(lowerBound, upperBound) {
        return Math.random() * (upperBound - lowerBound) + lowerBound // value in interval [lowerBound, upperBound]
    }

}
