import { BehaviorSubject } from 'rxjs';
import { TimediffControlUpdate, DateTimeControlUpdate, EpochNumber, DateTime, HttpRequestParams_diff } from '../types/custom.types';
import { GraphComponent } from '../applets/graph/graph.component';
import { TableComponent } from '../applets/table/table.component';
import { ImageryComponent } from '../applets/imagery/imagery.component';

export class RangesUpdateController {

  // these subjects update all uipanel values
  receivedDiffSubject = new BehaviorSubject<string>('');
  receivedCountSubject = new BehaviorSubject<string>('');
  receivedPastDelaySubject = new BehaviorSubject<string>('');
  receivedPresentDelaySubject = new BehaviorSubject<string>('');
  rangeDiffSubject = new BehaviorSubject<TimediffControlUpdate>({ timediff: '00:00:20' })
  rangeStartSubject = new BehaviorSubject<DateTimeControlUpdate>({ date: '1/1/1970', time: '12:12:12' });
  rangeEndSubject = new BehaviorSubject<DateTimeControlUpdate>({ date: '1/1/1970', time: '12:13:13' })

  constructor(
    private telemetryApplet: GraphComponent | TableComponent | ImageryComponent,
    diff?: string
  ) {
    if (diff) { // different set up by applet component if required
      this.rangeDiffSubject = new BehaviorSubject<TimediffControlUpdate>({ timediff: diff })
    }
  }


  //this function is called on every realtime resume OR clockUpdateSpeed change triggered by user
  resumeRealtimeClock() {
    if (this.telemetryApplet.clockSubscription && !this.telemetryApplet.clockSubscription.closed) {
      this.telemetryApplet.clockSubscription.unsubscribe()
    }
    //clock emits first value immediatly on subscription
    switch (this.telemetryApplet.clockUpdateSpeed) {
      case 'fast':
        this.telemetryApplet.clockSubscription = this.telemetryApplet.clockService.milliClock.subscribe(currentTime => {
          this.tickRealtimeControlsAndTrimCache(currentTime)
        })
        break;

      default:
        this.telemetryApplet.clockSubscription = this.telemetryApplet.clockService.clock.subscribe(currentTime => {
          this.tickRealtimeControlsAndTrimCache(currentTime)
        })
        break;
    }
  }

  tickRealtimeControlsAndTrimCache(
    currentTime: EpochNumber = Date.now(),
    currentDiffValue: string = this.rangeDiffSubject.getValue().timediff
  ) {
    //start + end controls
    let endTimestamp: DateTime = this.telemetryApplet.utilitiesService.timestampEpochnumberToDateTime(currentTime, '24', 3)
    let startTimestampAsEpochnumber: EpochNumber = this.telemetryApplet.utilitiesService.subtractTimestringFromEpochnumber(currentTime, currentDiffValue)
    let startTimestamp: DateTime = this.telemetryApplet.utilitiesService.timestampEpochnumberToDateTime(startTimestampAsEpochnumber, '24', 3);
    this.rangeEndSubject.next(endTimestamp)
    this.rangeStartSubject.next(startTimestamp)

    //trim telemetry cache if some point becomes obsolete
    let cache_withDateAsEpochnumber = this.telemetryApplet.utilitiesService.transformToCacheWithEpochnumbers(this.telemetryApplet.telemetryCache)
    let trimmedCache = this.telemetryApplet.cacheController.removeObsoletePointsFromCache(startTimestampAsEpochnumber, [...cache_withDateAsEpochnumber])
    if (trimmedCache.length !== cache_withDateAsEpochnumber.length) {
      this.telemetryApplet.telemetryCache = this.telemetryApplet.utilitiesService.transformToCacheWithDateObjects(trimmedCache)
    }
    //all received controls (using current telemetryCache)
    this.updateReceivedInfoControls();
  }

  updateDiffControl(params: HttpRequestParams_diff) {
    if (!params.hasOwnProperty('diff')) {
      console.error(".diff property expected.")
    } else {
      this.rangeDiffSubject.next({
        timediff: this.telemetryApplet.utilitiesService.timestampEpochnumberToTimestring(+params.diff, 3, false)
      })
    }
  }

  updateReceivedInfoControls() {
    //function is called on 1. every clock tick 2.every telemetry received
    let cacheLength = this.telemetryApplet.telemetryCache.length;
    this.receivedCountSubject.next(cacheLength.toString())
    if (cacheLength !== 0) {
      // update receivedDiff:
      let latestCacheTimestamp: EpochNumber = (this.telemetryApplet.telemetryCache[0][0] as Date).getTime()
      let earliestCacheTimestamp: EpochNumber = (this.telemetryApplet.telemetryCache[this.telemetryApplet.telemetryCache.length - 1][0] as Date).getTime()
      this.receivedDiffSubject.next(this.telemetryApplet.utilitiesService.timestampEpochnumberToTimestring(Math.abs(latestCacheTimestamp - earliestCacheTimestamp), 3, true))

      // update receivedPastDelay:
      let decimalMillisecondsPlaces = this.telemetryApplet.clockUpdateSpeed === 'normal' ? 1 : 2;
      let startControlValue: EpochNumber = this.telemetryApplet.utilitiesService.timestampDateTimeToEpochnumber(this.rangeStartSubject.getValue())
      let pastDelay: EpochNumber = startControlValue - latestCacheTimestamp;
      let sign: string = pastDelay <= 0 ? '+' : '-';
      this.receivedPastDelaySubject.next(sign + this.telemetryApplet.utilitiesService.timestampEpochnumberToTimestring(Math.abs(pastDelay), decimalMillisecondsPlaces, true))

      // update receivedPresentDelay:
      let endControlValue: EpochNumber = this.telemetryApplet.utilitiesService.timestampDateTimeToEpochnumber(this.rangeEndSubject.getValue())
      let presentDelay: EpochNumber = endControlValue - earliestCacheTimestamp;
      sign = presentDelay < 0 ? '-' : '+';
      this.receivedPresentDelaySubject.next(sign + this.telemetryApplet.utilitiesService.timestampEpochnumberToTimestring(Math.abs(presentDelay), decimalMillisecondsPlaces, true))
    }
    else { // cache is empty, nothing to extract information from
      this.receivedDiffSubject.next(null)
      this.receivedPastDelaySubject.next(null)
      this.receivedPresentDelaySubject.next(null)
    }
  }

}
