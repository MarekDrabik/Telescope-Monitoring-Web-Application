import { GraphComponent } from '../applets/graph/graph.component';
import { ImageryComponent } from '../applets/imagery/imagery.component';
import { TableComponent } from '../applets/table/table.component';
import { TelemetryPointReceived } from '../types/custom.types';


export class TelemetryCacheController {

  constructor(
    private telemetryApplet: GraphComponent | TableComponent | ImageryComponent
  ) { }

  // pushes point from right, removes obsolete telemetry values
  pushPointAndRemoveObsolete(newPoint: TelemetryPointReceived) {
    let rangeStartCurrentValue = this.telemetryApplet.rangesUpdateController.rangeStartSubject.getValue()
    let rangeStartTime: number = this.telemetryApplet.utilitiesService.timestampDateTimeToEpochnumber(rangeStartCurrentValue)
    let cache: TelemetryPointReceived[] = this.telemetryApplet.utilitiesService.transformToCacheWithEpochnumbers(this.telemetryApplet.telemetryCache)
    if (cache.length === 0 || newPoint[0] > cache[cache.length - 1][0]) { //dont push points that are already there
      cache.push(newPoint)
    }
    //cache has at least one real point at this time, but lets assert it 
    if (!cache[0] || cache[0][1] === null) console.error("V tomto bode by uz cache mal mat aspon 1 realne meranie!");
    if (cache[0][1] === null) { //graph specific: remove dummy point if its there (there will be dummy point only once at init)
      if (cache.shift()[1] !== null) console.error("Nechtiac si odstranil nenulovy point!.")
    }
    //remove obsolete points:
    let trimmedCache = this.telemetryApplet.cacheController.removeObsoletePointsFromCache(rangeStartTime, cache)
    this.telemetryApplet.telemetryCache = this.telemetryApplet.utilitiesService.transformToCacheWithDateObjects(trimmedCache)
  }

  appendHistory(historyData: TelemetryPointReceived[]) {
    /* telemetry cache can already contain data (retrieved by realtime update)
    this function appends data to the left side of the telemetry cache
    as union with the data that are already there */
    if (historyData.length === 0) {
      return; //no data received from server
    }
    let recentPoints = this.telemetryApplet.utilitiesService.transformToCacheWithEpochnumbers(this.telemetryApplet.telemetryCache)
    if (recentPoints[0] && recentPoints[0][1] === null) { //graph specific: remove dummy point if its there (there will be dummy point only once at init)
      if (recentPoints.shift()[1] !== null) console.error("Nechtiac si odstranil nenulovy point!.")
    }
    if (recentPoints.length === 0) { //cache is empty, so just fill it and we are done
      this.telemetryApplet.cacheController.overwriteWithHistory(historyData)
      return;
    }
    let historyPoints = this.telemetryApplet.cacheController._sortAndCropDataToCurrentRange(historyData)
    if (historyPoints.length === 0) return; //history retrieved was already obsolete (can happen in sequential retriever)

    let mostRecentHistoryPoint = historyPoints[historyPoints.length - 1]
    let indexOfcommonTimestamp = -1; //-1 to .slice(-1+1) <- identity. if we dont find common timestamp
    let index = 0;
    // find index of a point in recent points which has timestamp equal to the most recent timestamp of history points

    while (recentPoints[index][0] <= mostRecentHistoryPoint[0]) {
      indexOfcommonTimestamp++;
      index++;
      if (index === recentPoints.length) break;
    }
    //create union of two arrays
    let unionOfBoth = historyPoints.concat(recentPoints.slice(indexOfcommonTimestamp + 1))
    this.telemetryApplet.telemetryCache = this.telemetryApplet.utilitiesService.transformToCacheWithDateObjects(unionOfBoth)
  }

  overwriteWithHistory(historyData: TelemetryPointReceived[]) {
    let sortedAndCroped = this.telemetryApplet.cacheController._sortAndCropDataToCurrentRange(historyData)
    this.telemetryApplet.telemetryCache = this.telemetryApplet.utilitiesService.transformToCacheWithDateObjects(sortedAndCroped)
  }

  // this function is not component specific but I don't have better place for it
  removeObsoletePointsFromCache(rangeStartTime: number, cache_withDateAsEpochnumber: TelemetryPointReceived[]) {
    // cache with timestamps in Epochnumber format!
    while (cache_withDateAsEpochnumber.length > 0 && cache_withDateAsEpochnumber[0][0] < rangeStartTime) {
      cache_withDateAsEpochnumber.shift(); // remove value from left
    }
    return cache_withDateAsEpochnumber;
    // ideally, this function should directly modify applet cache but as one of its callers 
    // need to perform additional check before, it only returns resulting array 
  }

  // this function is not component specific but I don't have better place for it
  private _sortAndCropDataToCurrentRange(retrievedData: TelemetryPointReceived[]): TelemetryPointReceived[] {
    //crops from the left and right (historial view)
    let timeStart = this.telemetryApplet.rangesUpdateController.rangeStartSubject.getValue()
    let timeEnd = this.telemetryApplet.rangesUpdateController.rangeEndSubject.getValue()
    let rangeStartValue: number = this.telemetryApplet.utilitiesService.timestampDateTimeToEpochnumber(timeStart)
    let rangeEndValue: number = this.telemetryApplet.utilitiesService.timestampDateTimeToEpochnumber(timeEnd)
    let newCache = retrievedData.filter(([timestamp, ...value]) => {
      return ((timestamp >= rangeStartValue) && (timestamp <= rangeEndValue)); //return if true
    })
    return newCache.sort((a, b) => <number>a[0] - <number>b[0])
  }

}
