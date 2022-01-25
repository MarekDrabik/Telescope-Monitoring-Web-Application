const { update } = require("../models/telemetry.seqModel");

module.exports = class PositionGenerator {
  counter = 0;

  METER = 0.00001;
  UPDATE_PERIOD;
  MAX_GLOBAL_DEVIATION = Math.PI * 4 / 6;
  MAX_RADIANS_IN_ONE_TURN = 10;
  previousPosition_tuple;

  orientationAngle = Math.PI / 4;
  speed;

  constructor(updatePeriod, initialPosition_tuple, speedInMeterPerSecond = 10) {
    this.UPDATE_PERIOD = updatePeriod * 0.001;
    this.previousPosition_tuple = initialPosition_tuple;
    this.speed = speedInMeterPerSecond * this.METER;
  }

  _getNextPosition(currentPosition_tuple, orientationAngle, speed) {
    let latt = Math.cos(orientationAngle) * speed * this.UPDATE_PERIOD;
    let lngg = Math.sin(orientationAngle) * speed * this.UPDATE_PERIOD;

    return [currentPosition_tuple[0] + latt, currentPosition_tuple[1] + lngg];
  }

  generate = () => {
    if (this.counter > 1000000) {
      this.counter = 0;
    }
    if (this.counter % 5 === 4) {
        this.targetOrientationAngle = this.newTargetOrientationAngle(this.orientationAngle)
        this.orientationAngle = this.targetOrientationAngle;
    }
    this.orientationAngle = this.orientationWithOscillation(this.orientationAngle, 10)
    
    let newPosition_tuple = this._getNextPosition(
      this.previousPosition_tuple,
      this.orientationAngle,
      this.speed
    );
    this.previousPosition_tuple = newPosition_tuple;
    this.counter++;
    return newPosition_tuple.concat([this.counter]);
  };

  orientationWithOscillation(orientationAngle, oscillationAmountInDegrees) {
    let randomOscilationInDegrees = (Math.random() * oscillationAmountInDegrees -
    oscillationAmountInDegrees / 2);
    let randomOscilationInRadians = randomOscilationInDegrees * Math.PI / 180;
    return orientationAngle + randomOscilationInRadians
  }

  newTargetOrientationAngle (currentOrientationAngle) {
    let newDeviation = Math.random() * this.MAX_GLOBAL_DEVIATION - this.MAX_GLOBAL_DEVIATION / 2;
    return currentOrientationAngle + newDeviation;
  }

  _radToDeg(radians) {
    if (radians < 0) {
        radians = 2*Math.PI + radians;
    }
    let positiveDegrees = (radians * 180 / Math.PI) % 360;
    let positiveAndNegativeDegrees = positiveDegrees > 180 ? -(360 - positiveDegrees) : positiveDegrees;
    return positiveAndNegativeDegrees
  }
};

